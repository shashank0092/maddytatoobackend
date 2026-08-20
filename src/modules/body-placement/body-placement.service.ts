import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError, NotFoundError } from '../../core/errors/AppError';
import {
  BodyPlacementQueryDTO,
  CreateBodyPlacementDTO,
  SupportedLanguage,
  UpdateBodyPlacementDTO,
} from './body-placement.types';
import { parsePaginationQuery, createPaginationMeta } from '../../shared/pagination/pagination.utils';

export class BodyPlacementService {
  async getAll(query: BodyPlacementQueryDTO, isAdmin: boolean = false) {
    const { lang = 'en', search, sort = 'latest' } = query;
    const { page, limit, skip, take } = parsePaginationQuery(query.page, query.limit);

    const where: Prisma.BodyPlacementWhereInput = {};
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

    let orderBy: Prisma.BodyPlacementOrderByWithRelationInput = { created_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'name') {
      orderBy = { created_at: 'desc' }; // Fallback since Prisma doesn't sort well on 1-M relations natively
    }

    const [bodyPlacements, total] = await Promise.all([
      prisma.bodyPlacement.findMany({
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
      prisma.bodyPlacement.count({ where }),
    ]);

    const mappedData = bodyPlacements.map((bp) => {
      const translation =
        bp.translations.find((t) => t.language_code === lang) ||
        bp.translations.find((t) => t.language_code === 'en') ||
        bp.translations[0];

      return {
        id: bp.id,
        slug: bp.slug,
        name: translation?.name || '',
        description: translation?.description || null,
        altText: translation?.alt_text || null,
        coverImageKey: bp.cover_image_key,
        isActive: bp.is_active,
      };
    });

    if (sort === 'name') {
      mappedData.sort((a, b) => a.name.localeCompare(b.name));
    }

    const meta = createPaginationMeta({ page, limit, total });
    return { data: mappedData, meta };
  }

  async getBySlug(slug: string, lang: SupportedLanguage = 'en', isAdmin: boolean = false) {
    const where: Prisma.BodyPlacementWhereInput = { slug };
    if (!isAdmin) {
      where.is_active = true;
    }

    const bp = await prisma.bodyPlacement.findFirst({
      where,
      include: {
        translations: {
          where: { language_code: { in: [lang, 'en'] } },
        },
      },
    });

    if (!bp) {
      throw new NotFoundError('Body Placement not found');
    }

    const translation =
      bp.translations.find((t) => t.language_code === lang) ||
      bp.translations.find((t) => t.language_code === 'en') ||
      bp.translations[0];

    return {
      id: bp.id,
      slug: bp.slug,
      name: translation?.name || '',
      description: translation?.description || null,
      altText: translation?.alt_text || null,
      coverImageKey: bp.cover_image_key,
      isActive: bp.is_active,
    };
  }

  async create(data: CreateBodyPlacementDTO) {
    const existing = await prisma.bodyPlacement.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new AppError('A body placement with this slug already exists.', 409, 'BODY_PLACEMENT_SLUG_EXISTS');
    }
    return prisma.$transaction(async (tx) => {
      const bodyPlacement = await tx.bodyPlacement.create({
        data: {
          slug: data.slug,
          cover_image_key: data.coverImageKey,
          is_active: data.isActive ?? true,
        },
      });

      const translationsToCreate = [];

      translationsToCreate.push({
        body_placement_id: bodyPlacement.id,
        language_code: 'en',
        name: data.translations.en.name,
        description: data.translations.en.description,
        alt_text: data.translations.en.altText,
      });

      if (data.translations.gu) {
        translationsToCreate.push({
          body_placement_id: bodyPlacement.id,
          language_code: 'gu',
          name: data.translations.gu.name,
          description: data.translations.gu.description,
          alt_text: data.translations.gu.altText,
        });
      }

      await tx.bodyPlacementTranslation.createMany({
        data: translationsToCreate,
      });

      const fullBp = await tx.bodyPlacement.findUniqueOrThrow({
        where: { id: bodyPlacement.id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullBp);
    });
  }

  async update(id: string, data: UpdateBodyPlacementDTO) {
    const existing = await prisma.bodyPlacement.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Body Placement not found');
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.bodyPlacement.findUnique({ where: { slug: data.slug } });
      if (slugConflict) {
        throw new AppError('A body placement with this slug already exists.', 409, 'BODY_PLACEMENT_SLUG_EXISTS');
      }
    }

    return prisma.$transaction(async (tx) => {
      await tx.bodyPlacement.update({
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
            await tx.bodyPlacementTranslation.upsert({
              where: {
                body_placement_id_language_code: {
                  body_placement_id: id,
                  language_code: lang,
                },
              },
              update: {
                ...(tData.name !== undefined && { name: tData.name }),
                ...(tData.description !== undefined && { description: tData.description }),
                ...(tData.altText !== undefined && { alt_text: tData.altText }),
              },
              create: {
                body_placement_id: id,
                language_code: lang,
                name: tData.name!,
                description: tData.description,
                alt_text: tData.altText,
              },
            });
          }
        }
      }

      const fullBp = await tx.bodyPlacement.findUniqueOrThrow({
        where: { id },
        include: { translations: true },
      });

      return this.formatAdminResponse(fullBp);
    });
  }

  async delete(id: string) {
    const existing = await prisma.bodyPlacement.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Body Placement not found');
    }

    await prisma.bodyPlacement.delete({ where: { id } });
  }

  private formatAdminResponse(bp: Prisma.BodyPlacementGetPayload<{ include: { translations: true } }>) {
    return {
      id: bp.id,
      slug: bp.slug,
      coverImageKey: bp.cover_image_key,
      isActive: bp.is_active,
      translations: bp.translations.map((t) => ({
        languageCode: t.language_code,
        name: t.name,
        description: t.description,
        altText: t.alt_text,
      })),
    };
  }
}

export const bodyPlacementService = new BodyPlacementService();
