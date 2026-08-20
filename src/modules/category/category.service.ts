import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError, NotFoundError } from '../../core/errors/AppError';
import {
  CategoryQueryDTO,
  CreateCategoryDTO,
  SupportedLanguage,
  UpdateCategoryDTO,
} from './category.types';
import { parsePaginationQuery, createPaginationMeta } from '../../shared/pagination/pagination.utils';

export class CategoryService {
  async getAll(query: CategoryQueryDTO, isAdmin: boolean = false) {
    const { lang = 'en', search, sort = 'latest' } = query;
    const { page, limit, skip, take } = parsePaginationQuery(query.page, query.limit);

    const where: Prisma.CategoryWhereInput = {};
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

    let orderBy: Prisma.CategoryOrderByWithRelationInput = { created_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'name') {
      orderBy = { created_at: 'desc' }; // Fallback since Prisma doesn't sort well on 1-M relations natively
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
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
      prisma.category.count({ where }),
    ]);

    const mappedData = categories.map((cat) => {
      const translation =
        cat.translations.find((t) => t.language_code === lang) ||
        cat.translations.find((t) => t.language_code === 'en') ||
        cat.translations[0];

      return {
        id: cat.id,
        slug: cat.slug,
        name: translation?.name || '',
        description: translation?.description || null,
        altText: translation?.alt_text || null,
        coverImageKey: cat.cover_image_key,
        isActive: cat.is_active,
      };
    });

    if (sort === 'name') {
      mappedData.sort((a, b) => a.name.localeCompare(b.name));
    }

    const meta = createPaginationMeta({ page, limit, total });
    return { data: mappedData, meta };
  }

  async getBySlug(slug: string, lang: SupportedLanguage = 'en', isAdmin: boolean = false) {
    const where: Prisma.CategoryWhereInput = { slug };
    if (!isAdmin) {
      where.is_active = true;
    }

    const cat = await prisma.category.findFirst({
      where,
      include: {
        translations: {
          where: { language_code: { in: [lang, 'en'] } },
        },
      },
    });

    if (!cat) {
      throw new NotFoundError('Category not found');
    }

    const translation =
      cat.translations.find((t) => t.language_code === lang) ||
      cat.translations.find((t) => t.language_code === 'en') ||
      cat.translations[0];

    return {
      id: cat.id,
      slug: cat.slug,
      name: translation?.name || '',
      description: translation?.description || null,
      altText: translation?.alt_text || null,
      coverImageKey: cat.cover_image_key,
      isActive: cat.is_active,
    };
  }

  async create(data: CreateCategoryDTO) {
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new AppError('A category with this slug already exists.', 409, 'CATEGORY_SLUG_EXISTS');
    }
    return prisma.$transaction(async (tx) => {
      const category = await tx.category.create({
        data: {
          slug: data.slug,
          cover_image_key: data.coverImageKey,
          is_active: data.isActive ?? true,
        },
      });

      const translationsToCreate = [];

      translationsToCreate.push({
        category_id: category.id,
        language_code: 'en',
        name: data.translations.en.name,
        description: data.translations.en.description,
        alt_text: data.translations.en.altText,
      });

      if (data.translations.gu) {
        translationsToCreate.push({
          category_id: category.id,
          language_code: 'gu',
          name: data.translations.gu.name,
          description: data.translations.gu.description,
          alt_text: data.translations.gu.altText,
        });
      }

      await tx.categoryTranslation.createMany({
        data: translationsToCreate,
      });

      const fullCat = await tx.category.findUniqueOrThrow({
        where: { id: category.id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullCat);
    });
  }

  async update(id: string, data: UpdateCategoryDTO) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.category.findUnique({ where: { slug: data.slug } });
      if (slugConflict) {
        throw new AppError('A category with this slug already exists.', 409, 'CATEGORY_SLUG_EXISTS');
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.category.update({
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
            await tx.categoryTranslation.upsert({
              where: {
                category_id_language_code: {
                  category_id: id,
                  language_code: lang,
                },
              },
              update: {
                ...(tData.name !== undefined && { name: tData.name }),
                ...(tData.description !== undefined && { description: tData.description }),
                ...(tData.altText !== undefined && { alt_text: tData.altText }),
              },
              create: {
                category_id: id,
                language_code: lang,
                name: tData.name!,
                description: tData.description,
                alt_text: tData.altText,
              },
            });
          }
        }
      }

      const fullCat = await tx.category.findUniqueOrThrow({
        where: { id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullCat);
    });
  }

  async delete(id: string) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    await prisma.category.delete({ where: { id } });
  }

  private formatAdminResponse(cat: Prisma.CategoryGetPayload<{ include: { translations: true } }>) {
    return {
      id: cat.id,
      slug: cat.slug,
      coverImageKey: cat.cover_image_key,
      isActive: cat.is_active,
      translations: cat.translations.map((t) => ({
        languageCode: t.language_code,
        name: t.name,
        description: t.description,
        altText: t.alt_text,
      })),
    };
  }
}

export const categoryService = new CategoryService();
