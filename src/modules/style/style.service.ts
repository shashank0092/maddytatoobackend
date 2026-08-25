import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError, NotFoundError } from '../../core/errors/AppError';
import {
  StyleQueryDTO,
  CreateStyleDTO,
  SupportedLanguage,
  UpdateStyleDTO,
} from './style.types';
import { parsePaginationQuery, createPaginationMeta } from '../../shared/pagination/pagination.utils';

export class StyleService {
  async getAll(query: StyleQueryDTO, isAdmin: boolean = false) {
    const { lang = 'en', search, sort = 'latest' } = query;
    const { page, limit, skip, take } = parsePaginationQuery(query.page, query.limit);

    const where: Prisma.StyleWhereInput = {};
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

    let orderBy: Prisma.StyleOrderByWithRelationInput = { created_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'name') {
      orderBy = { created_at: 'desc' }; // Fallback since Prisma doesn't sort well on 1-M relations natively
    }

    const [styles, total] = await Promise.all([
      prisma.style.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          translations: true,
        },
      }),
      prisma.style.count({ where }),
    ]);

    const mappedData = styles.map((col) => {
      const translation =
        col.translations.find((t) => t.language_code === lang) ||
        col.translations.find((t) => t.language_code === 'en') ||
        col.translations[0];

      return {
        id: col.id,
        slug: col.slug,
        name: translation?.name || '',
        description: translation?.description || null,
        altText: translation?.alt_text || null,
        coverImageKey: col.cover_image_key,
        isActive: col.is_active,
        translations: col.translations.map((t) => ({
          languageCode: t.language_code,
          name: t.name,
          description: t.description,
          altText: t.alt_text,
        })),
      };
    });

    if (sort === 'name') {
      mappedData.sort((a, b) => a.name.localeCompare(b.name));
    }

    const meta = createPaginationMeta({ page, limit, total });
    return { data: mappedData, meta };
  }

  async getBySlug(slug: string, lang: SupportedLanguage = 'en', isAdmin: boolean = false) {
    const where: Prisma.StyleWhereInput = { slug };
    if (!isAdmin) {
      where.is_active = true;
    }

    const col = await prisma.style.findFirst({
      where,
      include: {
        translations: true,
      },
    });

    if (!col) {
      throw new NotFoundError('Style not found');
    }

    const translation =
      col.translations.find((t) => t.language_code === lang) ||
      col.translations.find((t) => t.language_code === 'en') ||
      col.translations[0];

    return {
      id: col.id,
      slug: col.slug,
      name: translation?.name || '',
      description: translation?.description || null,
      altText: translation?.alt_text || null,
      coverImageKey: col.cover_image_key,
      isActive: col.is_active,
      translations: col.translations.map((t) => ({
        languageCode: t.language_code,
        name: t.name,
        description: t.description,
        altText: t.alt_text,
      })),
    };
  }

  async create(data: CreateStyleDTO) {
    const existing = await prisma.style.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new AppError('A style with this slug already exists.', 409, 'STYLE_SLUG_EXISTS');
    }
    return prisma.$transaction(async (tx) => {
      const style = await tx.style.create({
        data: {
          slug: data.slug,
          cover_image_key: data.coverImageKey,
          is_active: data.isActive ?? true,
        },
      });

      const translationsToCreate = [];

      translationsToCreate.push({
        style_id: style.id,
        language_code: 'en',
        name: data.translations.en.name,
        description: data.translations.en.description,
        alt_text: data.translations.en.altText,
      });

      if (data.translations.gu) {
        translationsToCreate.push({
          style_id: style.id,
          language_code: 'gu',
          name: data.translations.gu.name,
          description: data.translations.gu.description,
          alt_text: data.translations.gu.altText,
        });
      }

      await tx.styleTranslation.createMany({
        data: translationsToCreate,
      });

      const fullCol = await tx.style.findUniqueOrThrow({
        where: { id: style.id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullCol);
    });
  }

  async update(id: string, data: UpdateStyleDTO) {
    const existing = await prisma.style.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Style not found');
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.style.findUnique({ where: { slug: data.slug } });
      if (slugConflict) {
        throw new AppError('A style with this slug already exists.', 409, 'STYLE_SLUG_EXISTS');
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.style.update({
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
            await tx.styleTranslation.upsert({
              where: {
                style_id_language_code: {
                  style_id: id,
                  language_code: lang,
                },
              },
              update: {
                ...(tData.name !== undefined && { name: tData.name }),
                ...(tData.description !== undefined && { description: tData.description }),
                ...(tData.altText !== undefined && { alt_text: tData.altText }),
              },
              create: {
                style_id: id,
                language_code: lang,
                name: tData.name!,
                description: tData.description,
                alt_text: tData.altText,
              },
            });
          }
        }
      }

      const fullCol = await tx.style.findUniqueOrThrow({
        where: { id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullCol);
    });
  }

  async delete(id: string) {
    const existing = await prisma.style.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Style not found');
    }

    await prisma.style.delete({ where: { id } });
  }

  private formatAdminResponse(col: Prisma.StyleGetPayload<{ include: { translations: true } }>) {
    return {
      id: col.id,
      slug: col.slug,
      coverImageKey: col.cover_image_key,
      isActive: col.is_active,
      translations: col.translations.map((t) => ({
        languageCode: t.language_code,
        name: t.name,
        description: t.description,
        altText: t.alt_text,
      })),
    };
  }
}

export const styleService = new StyleService();
