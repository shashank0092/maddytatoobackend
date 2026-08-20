import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { ConflictError, NotFoundError } from '../../core/errors/AppError';
import {
  ContentTypeQueryDTO,
  CreateContentTypeDTO,
  SupportedLanguage,
  UpdateContentTypeDTO,
} from './content-type.types';
import { parsePaginationQuery, createPaginationMeta } from '../../shared/pagination/pagination.utils';

export class ContentTypeService {
  async getAll(query: ContentTypeQueryDTO, isAdmin: boolean = false) {
    const { lang = 'en', search, sort = 'latest' } = query;
    const { page, limit, skip, take } = parsePaginationQuery(query.page, query.limit);

    const where: Prisma.ContentTypeWhereInput = {};
    if (!isAdmin) {
      where.is_active = true;
    }

    if (search) {
      where.translations = {
        some: {
          language_code: lang,
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      };
    }

    let orderBy: Prisma.ContentTypeOrderByWithRelationInput = { created_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'name') {
      // Sort by the translation name of the requested language.
      // Prisma has experimental support for ordering by relation aggregates but standard relation ordering requires sorting on an included relation or using raw SQL.
      // For standard relation, it's easier to fetch and sort in memory if not highly paginated, or sort by standard Prisma relations if available.
      // Since it's a 1-to-many relation, we cannot easily sort by translation name directly in standard Prisma without advanced features.
      // We will fallback to created_at if we can't reliably sort by a 1-M relation's field.
      // Actually, we can just sort by created_at as fallback for now or ignore for simplicity if not easily supported by Prisma natively for 1-M.
      orderBy = { created_at: 'desc' }; 
    }

    const [contentTypes, total] = await Promise.all([
      prisma.contentType.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          translations: {
            where: { language_code: { in: [lang, 'en'] } },
          },
        },
      }),
      prisma.contentType.count({ where }),
    ]);

    // Map fallbacks
    const mappedData = contentTypes.map((ct) => {
      // Find requested language or fallback to English
      const translation =
        ct.translations.find((t) => t.language_code === lang) ||
        ct.translations.find((t) => t.language_code === 'en') ||
        ct.translations[0];

      return {
        id: ct.id,
        slug: ct.slug,
        name: translation?.name || '',
        description: translation?.description || null,
        altText: translation?.alt_text || null,
        coverImageKey: ct.cover_image_key,
        isActive: ct.is_active,
      };
    });

    if (sort === 'name') {
      mappedData.sort((a, b) => a.name.localeCompare(b.name));
    }

    const meta = createPaginationMeta({ page, limit, total });
    return { data: mappedData, meta };
  }

  async getBySlug(slug: string, lang: SupportedLanguage = 'en', isAdmin: boolean = false) {
    const where: Prisma.ContentTypeWhereInput = { slug };
    if (!isAdmin) {
      where.is_active = true;
    }

    const ct = await prisma.contentType.findFirst({
      where,
      include: {
        translations: {
          where: { language_code: { in: [lang, 'en'] } },
        },
      },
    });

    if (!ct) {
      throw new NotFoundError('Content Type not found');
    }

    const translation =
      ct.translations.find((t) => t.language_code === lang) ||
      ct.translations.find((t) => t.language_code === 'en') ||
      ct.translations[0];

    return {
      id: ct.id,
      slug: ct.slug,
      name: translation?.name || '',
      description: translation?.description || null,
      altText: translation?.alt_text || null,
      coverImageKey: ct.cover_image_key,
      isActive: ct.is_active,
    };
  }

  async create(data: CreateContentTypeDTO) {
    const existing = await prisma.contentType.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictError('A content type with this slug already exists.');
    }

    return prisma.$transaction(async (tx) => {
      const contentType = await tx.contentType.create({
        data: {
          slug: data.slug,
          cover_image_key: data.coverImageKey,
          is_active: data.isActive ?? true,
        },
      });

      const translationsToCreate = [];

      translationsToCreate.push({
        content_type_id: contentType.id,
        language_code: 'en',
        name: data.translations.en.name,
        description: data.translations.en.description,
        alt_text: data.translations.en.altText,
      });

      if (data.translations.gu) {
        translationsToCreate.push({
          content_type_id: contentType.id,
          language_code: 'gu',
          name: data.translations.gu.name,
          description: data.translations.gu.description,
          alt_text: data.translations.gu.altText,
        });
      }

      await tx.contentTypeTranslation.createMany({
        data: translationsToCreate,
      });

      const fullCt = await tx.contentType.findUniqueOrThrow({
        where: { id: contentType.id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullCt);
    });
  }

  async update(id: string, data: UpdateContentTypeDTO) {
    const existing = await prisma.contentType.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Content Type not found');
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.contentType.findUnique({ where: { slug: data.slug } });
      if (slugConflict) {
        throw new ConflictError('A content type with this slug already exists.');
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.contentType.update({
        where: { id },
        data: {
          ...(data.slug && { slug: data.slug }),
          ...(data.coverImageKey !== undefined && { cover_image_key: data.coverImageKey }),
          ...(data.isActive !== undefined && { is_active: data.isActive }),
        },
      });

      if (data.translations) {
        for (const [lang, tData] of Object.entries(data.translations)) {
          if (tData) {
            await tx.contentTypeTranslation.upsert({
              where: {
                content_type_id_language_code: {
                  content_type_id: id,
                  language_code: lang,
                },
              },
              update: {
                ...(tData.name !== undefined && { name: tData.name }),
                ...(tData.description !== undefined && { description: tData.description }),
                ...(tData.altText !== undefined && { alt_text: tData.altText }),
              },
              create: {
                content_type_id: id,
                language_code: lang,
                name: tData.name!,
                description: tData.description,
                alt_text: tData.altText,
              },
            });
          }
        }
      }

      const fullCt = await tx.contentType.findUniqueOrThrow({
        where: { id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullCt);
    });
  }

  async delete(id: string) {
    const existing = await prisma.contentType.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Content Type not found');
    }

    await prisma.contentType.delete({ where: { id } });
  }

  private formatAdminResponse(ct: Prisma.ContentTypeGetPayload<{ include: { translations: true } }>) {
    return {
      id: ct.id,
      slug: ct.slug,
      coverImageKey: ct.cover_image_key,
      isActive: ct.is_active,
      translations: ct.translations.map((t) => ({
        languageCode: t.language_code,
        name: t.name,
        description: t.description,
        altText: t.alt_text,
      })),
    };
  }
}

export const contentTypeService = new ContentTypeService();
