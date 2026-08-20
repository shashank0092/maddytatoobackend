import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError, NotFoundError } from '../../core/errors/AppError';
import {
  TagQueryDTO,
  CreateTagDTO,
  SupportedLanguage,
  UpdateTagDTO,
} from './tag.types';
import { parsePaginationQuery, createPaginationMeta } from '../../shared/pagination/pagination.utils';

export class TagService {
  async getAll(query: TagQueryDTO, isAdmin: boolean = false) {
    const { lang = 'en', search, sort = 'name' } = query;
    const { page, limit, skip, take } = parsePaginationQuery(query.page, query.limit);

    const where: Prisma.TagWhereInput = {};
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

    let orderBy: Prisma.TagOrderByWithRelationInput = { created_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'latest') {
      orderBy = { created_at: 'desc' };
    } else if (sort === 'name') {
      orderBy = { created_at: 'desc' }; // Fallback since Prisma doesn't sort well on 1-M relations natively
    }

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
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
      prisma.tag.count({ where }),
    ]);

    const mappedData = tags.map((t) => {
      const translation =
        t.translations.find((tr) => tr.language_code === lang) ||
        t.translations.find((tr) => tr.language_code === 'en') ||
        t.translations[0];

      return {
        id: t.id,
        slug: t.slug,
        name: translation?.name || '',
        isActive: t.is_active,
      };
    });

    if (sort === 'name') {
      mappedData.sort((a, b) => a.name.localeCompare(b.name));
    }

    const meta = createPaginationMeta({ page, limit, total });
    return { data: mappedData, meta };
  }

  async getBySlug(slug: string, lang: SupportedLanguage = 'en', isAdmin: boolean = false) {
    const where: Prisma.TagWhereInput = { slug };
    if (!isAdmin) {
      where.is_active = true;
    }

    const tag = await prisma.tag.findFirst({
      where,
      include: {
        translations: {
          where: { language_code: { in: [lang, 'en'] } },
        },
      },
    });

    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    const translation =
      tag.translations.find((t) => t.language_code === lang) ||
      tag.translations.find((t) => t.language_code === 'en') ||
      tag.translations[0];

    return {
      id: tag.id,
      slug: tag.slug,
      name: translation?.name || '',
      isActive: tag.is_active,
    };
  }

  async create(data: CreateTagDTO) {
    const existing = await prisma.tag.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new AppError('A tag with this slug already exists.', 409, 'TAG_SLUG_EXISTS');
    }
    return prisma.$transaction(async (tx) => {
      const tag = await tx.tag.create({
        data: {
          slug: data.slug,
          is_active: data.isActive ?? true,
        },
      });

      const translationsToCreate = [];

      translationsToCreate.push({
        tag_id: tag.id,
        language_code: 'en',
        name: data.translations.en.name,
      });

      if (data.translations.gu) {
        translationsToCreate.push({
          tag_id: tag.id,
          language_code: 'gu',
          name: data.translations.gu.name,
        });
      }

      await tx.tagTranslation.createMany({
        data: translationsToCreate,
      });

      const fullTag = await tx.tag.findUniqueOrThrow({
        where: { id: tag.id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullTag);
    });
  }

  async update(id: string, data: UpdateTagDTO) {
    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Tag not found');
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.tag.findUnique({ where: { slug: data.slug } });
      if (slugConflict) {
        throw new AppError('A tag with this slug already exists.', 409, 'TAG_SLUG_EXISTS');
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.tag.update({
        where: { id },
        data: {
          ...(data.slug && { slug: data.slug }),
          ...(data.isActive !== undefined && { is_active: data.isActive }),
        },
      });

      if (data.translations) {
        for (const [lang, tData] of Object.entries(data.translations)) {
          if (tData) {
            await tx.tagTranslation.upsert({
              where: {
                tag_id_language_code: {
                  tag_id: id,
                  language_code: lang,
                },
              },
              update: {
                ...(tData.name !== undefined && { name: tData.name }),
              },
              create: {
                tag_id: id,
                language_code: lang,
                name: tData.name!,
              },
            });
          }
        }
      }

      const fullTag = await tx.tag.findUniqueOrThrow({
        where: { id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullTag);
    });
  }

  async delete(id: string) {
    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Tag not found');
    }

    await prisma.tag.delete({ where: { id } });
  }

  private formatAdminResponse(tag: Prisma.TagGetPayload<{ include: { translations: true } }>) {
    return {
      id: tag.id,
      slug: tag.slug,
      isActive: tag.is_active,
      translations: tag.translations.map((t) => ({
        languageCode: t.language_code,
        name: t.name,
      })),
    };
  }
}

export const tagService = new TagService();
