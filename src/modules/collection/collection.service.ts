import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError, NotFoundError } from '../../core/errors/AppError';
import {
  CollectionQueryDTO,
  CreateCollectionDTO,
  SupportedLanguage,
  UpdateCollectionDTO,
} from './collection.types';
import { parsePaginationQuery, createPaginationMeta } from '../../shared/pagination/pagination.utils';

export class CollectionService {
  async getAll(query: CollectionQueryDTO, isAdmin: boolean = false) {
    const { lang = 'en', search, sort = 'latest' } = query;
    const { page, limit, skip, take } = parsePaginationQuery(query.page, query.limit);

    const where: Prisma.CollectionWhereInput = {};
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

    let orderBy: Prisma.CollectionOrderByWithRelationInput = { created_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'name') {
      orderBy = { created_at: 'desc' }; // Fallback since Prisma doesn't sort well on 1-M relations natively
    }

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
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
      prisma.collection.count({ where }),
    ]);

    const mappedData = collections.map((col) => {
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
      };
    });

    if (sort === 'name') {
      mappedData.sort((a, b) => a.name.localeCompare(b.name));
    }

    const meta = createPaginationMeta({ page, limit, total });
    return { data: mappedData, meta };
  }

  async getBySlug(slug: string, lang: SupportedLanguage = 'en', isAdmin: boolean = false) {
    const where: Prisma.CollectionWhereInput = { slug };
    if (!isAdmin) {
      where.is_active = true;
    }

    const col = await prisma.collection.findFirst({
      where,
      include: {
        translations: {
          where: { language_code: { in: [lang, 'en'] } },
        },
      },
    });

    if (!col) {
      throw new NotFoundError('Collection not found');
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
    };
  }

  async create(data: CreateCollectionDTO) {
    const existing = await prisma.collection.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new AppError('A collection with this slug already exists.', 409, 'COLLECTION_SLUG_EXISTS');
    }
    return prisma.$transaction(async (tx) => {
      const collection = await tx.collection.create({
        data: {
          slug: data.slug,
          cover_image_key: data.coverImageKey,
          is_active: data.isActive ?? true,
        },
      });

      const translationsToCreate = [];

      translationsToCreate.push({
        collection_id: collection.id,
        language_code: 'en',
        name: data.translations.en.name,
        description: data.translations.en.description,
        alt_text: data.translations.en.altText,
      });

      if (data.translations.gu) {
        translationsToCreate.push({
          collection_id: collection.id,
          language_code: 'gu',
          name: data.translations.gu.name,
          description: data.translations.gu.description,
          alt_text: data.translations.gu.altText,
        });
      }

      await tx.collectionTranslation.createMany({
        data: translationsToCreate,
      });

      const fullCol = await tx.collection.findUniqueOrThrow({
        where: { id: collection.id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullCol);
    });
  }

  async update(id: string, data: UpdateCollectionDTO) {
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Collection not found');
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.collection.findUnique({ where: { slug: data.slug } });
      if (slugConflict) {
        throw new AppError('A collection with this slug already exists.', 409, 'COLLECTION_SLUG_EXISTS');
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.collection.update({
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
            await tx.collectionTranslation.upsert({
              where: {
                collection_id_language_code: {
                  collection_id: id,
                  language_code: lang,
                },
              },
              update: {
                ...(tData.name !== undefined && { name: tData.name }),
                ...(tData.description !== undefined && { description: tData.description }),
                ...(tData.altText !== undefined && { alt_text: tData.altText }),
              },
              create: {
                collection_id: id,
                language_code: lang,
                name: tData.name!,
                description: tData.description,
                alt_text: tData.altText,
              },
            });
          }
        }
      }

      const fullCol = await tx.collection.findUniqueOrThrow({
        where: { id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullCol);
    });
  }

  async delete(id: string) {
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Collection not found');
    }

    await prisma.collection.delete({ where: { id } });
  }

  private formatAdminResponse(col: Prisma.CollectionGetPayload<{ include: { translations: true } }>) {
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

export const collectionService = new CollectionService();
