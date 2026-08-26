import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError, NotFoundError } from '../../core/errors/AppError';
import { parsePaginationQuery, createPaginationMeta } from '../../shared/pagination/pagination.utils';
import {
  ContentQueryDTO,
  CreateContentDTO,
  UpdateContentBasicDTO,
  UpdateContentMediaDTO,
  UpdateContentTaxonomyDTO,
  UpdateContentDisplayDTO,
  UpdateContentSeoDTO,
  UpdateContentStatusDTO,
  SupportedLanguage,
} from './content.types';

export class ContentService {
  async getAll(query: ContentQueryDTO, isAdmin: boolean = false) {
    const { lang = 'en', search, sort = 'latest', status, isFeatured } = query;
    const { page, limit, skip, take } = parsePaginationQuery(query.page as number, query.limit as number);

    const where: Prisma.ContentWhereInput = {};
    
    // PUBLIC constraints
    if (!isAdmin) {
      where.status = 'PUBLISHED';
    } else if (status) {
      where.status = status as any;
    }

    if (isFeatured !== undefined) {
      where.is_featured = isFeatured as boolean;
    }

    if (search) {
      where.translations = {
        some: {
          language_code: lang,
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { short_description: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { story: { contains: search, mode: 'insensitive' } },
            { inspiration: { contains: search, mode: 'insensitive' } },
            { meaning: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    // Taxonomy filters using slugs
    if (query.contentType) where.content_type = { slug: query.contentType };
    if (query.category) where.category = { slug: query.category };
    if (query.collection) where.collection = { slug: query.collection };
    if (query.style) where.style = { slug: query.style };
    if (query.bodyPlacement) where.body_placement = { slug: query.bodyPlacement };
    if (query.tag) {
      where.tags = {
        some: {
          tag: { slug: query.tag }
        }
      };
    }

    let orderBy: Prisma.ContentOrderByWithRelationInput = { published_at: 'desc' };
    if (sort === 'oldest') {
      orderBy = { published_at: 'asc' };
    } else if (sort === 'title') {
      orderBy = { published_at: 'desc' }; // Handled in JS fallback as Prisma can't easily sort by relational translation array
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          translations: true,
          media: { where: { role: 'COVER', is_active: true }, take: 1, orderBy: { sort_order: 'asc' } },
          content_type: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
          category: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
          collection: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
          style: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
          body_placement: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
          tags: { include: { tag: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } } } },
        },
      }),
      prisma.content.count({ where }),
    ]);

    const mappedData = contents.map((c) => {
      const translation = c.translations.find((t) => t.language_code === lang) || c.translations.find((t) => t.language_code === 'en') || c.translations[0];
      const ctTrans = c.content_type?.translations.find(t => t.language_code === lang) || c.content_type?.translations.find(t => t.language_code === 'en');
      const catTrans = c.category?.translations.find(t => t.language_code === lang) || c.category?.translations.find(t => t.language_code === 'en');
      const colTrans = c.collection?.translations.find(t => t.language_code === lang) || c.collection?.translations.find(t => t.language_code === 'en');
      const stTrans = c.style?.translations.find(t => t.language_code === lang) || c.style?.translations.find(t => t.language_code === 'en');
      const bpTrans = c.body_placement?.translations.find(t => t.language_code === lang) || c.body_placement?.translations.find(t => t.language_code === 'en');

      return {
        id: c.id,
        slug: c.slug,
        isFeatured: c.is_featured,
        title: translation?.title || '',
        shortDescription: translation?.short_description || null,
        coverImageKey: c.media[0]?.s3_key || null,
        contentType: c.content_type ? { slug: c.content_type.slug, name: ctTrans?.name || '' } : null,
        category: c.category ? { slug: c.category.slug, name: catTrans?.name || '' } : null,
        collection: c.collection ? { slug: c.collection.slug, name: colTrans?.name || '' } : null,
        style: c.style ? { slug: c.style.slug, name: stTrans?.name || '' } : null,
        bodyPlacement: c.body_placement ? { slug: c.body_placement.slug, name: bpTrans?.name || '' } : null,
        tags: c.tags.map(ct => {
          const tTrans = ct.tag.translations.find(t => t.language_code === lang) || ct.tag.translations.find(t => t.language_code === 'en');
          return { slug: ct.tag.slug, name: tTrans?.name || '' };
        }),
        translations: c.translations.map((t) => ({
          languageCode: t.language_code,
          title: t.title,
          shortDescription: t.short_description,
        })),
        ...(isAdmin ? { status: c.status, publishedAt: c.published_at } : {})
      };
    });

    if (sort === 'title') {
      mappedData.sort((a, b) => a.title.localeCompare(b.title));
    }

    return { data: mappedData, meta: createPaginationMeta({ page, limit, total }) };
  }

  async getBySlug(slug: string, lang: SupportedLanguage = 'en', isAdmin: boolean = false) {
    const where: Prisma.ContentWhereInput = { slug };
    if (!isAdmin) {
      where.status = 'PUBLISHED';
    }

    const c = await prisma.content.findFirst({
      where,
      include: {
        translations: true,
        media: { orderBy: { sort_order: 'asc' } },
        content_type: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
        category: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
        collection: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
        style: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
        body_placement: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
        tags: { include: { tag: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } } } },
        displays: { orderBy: { sort_order: 'asc' } },
        seo: { include: { translations: { where: { language_code: { in: [lang, 'en'] } } } } },
      }
    });

    if (!c) {
      throw new NotFoundError('Content not found');
    }

    const translation = c.translations.find((t) => t.language_code === lang) || c.translations.find((t) => t.language_code === 'en') || c.translations[0];
    const seoTranslation = c.seo?.translations.find(t => t.language_code === lang) || c.seo?.translations.find(t => t.language_code === 'en');
    
    const resolveTaxonomy = (tax: any) => tax ? { slug: tax.slug, name: (tax.translations.find((t: any) => t.language_code === lang) || tax.translations.find((t: any) => t.language_code === 'en'))?.name || '' } : null;

    return {
      id: c.id,
      slug: c.slug,
      status: c.status,
      isFeatured: c.is_featured,
      publishedAt: c.published_at,
      title: translation?.title || '',
      shortDescription: translation?.short_description || null,
      description: translation?.description || null,
      story: translation?.story || null,
      inspiration: translation?.inspiration || null,
      meaning: translation?.meaning || null,
      process: translation?.process || null,
      media: c.media.map(m => ({
        id: m.id,
        role: m.role,
        mediaType: m.media_type,
        s3Key: m.s3_key,
        altText: m.alt_text,
        sortOrder: m.sort_order,
        isActive: m.is_active,
      })),
      contentType: resolveTaxonomy(c.content_type),
      category: resolveTaxonomy(c.category),
      collection: resolveTaxonomy(c.collection),
      style: resolveTaxonomy(c.style),
      bodyPlacement: resolveTaxonomy(c.body_placement),
      tags: c.tags.map(ct => resolveTaxonomy(ct.tag)),
      displays: c.displays.map(d => ({
        surface: d.surface,
        displayType: d.display_type,
        sortOrder: d.sort_order,
        isActive: d.is_active,
      })),
      seo: c.seo ? {
        ogImageKey: c.seo.og_image_key,
        canonicalUrl: c.seo.canonical_url,
        metaTitle: seoTranslation?.meta_title || null,
        metaDescription: seoTranslation?.meta_description || null,
        keywords: seoTranslation?.keywords || null,
        ogTitle: seoTranslation?.og_title || null,
        ogDescription: seoTranslation?.og_description || null,
      } : null,
      translations: c.translations.map((t) => ({
        languageCode: t.language_code,
        title: t.title,
        shortDescription: t.short_description,
        description: t.description,
        story: t.story,
        inspiration: t.inspiration,
        meaning: t.meaning,
        process: t.process,
      })),
    };
  }

  async create(data: CreateContentDTO) {
    const existing = await prisma.content.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError('A content with this slug already exists.', 409, 'CONTENT_SLUG_EXISTS');

    return prisma.$transaction(async (tx) => {
      // Validate Taxonomy
      const ct = await tx.contentType.findUnique({ where: { id: data.contentTypeId } });
      if (!ct) throw new NotFoundError('Content Type not found');

      if (data.categoryId) { const x = await tx.category.findUnique({ where: { id: data.categoryId } }); if (!x) throw new NotFoundError('Category not found'); }
      if (data.collectionId) { const x = await tx.collection.findUnique({ where: { id: data.collectionId } }); if (!x) throw new NotFoundError('Collection not found'); }
      if (data.styleId) { const x = await tx.style.findUnique({ where: { id: data.styleId } }); if (!x) throw new NotFoundError('Style not found'); }
      if (data.bodyPlacementId) { const x = await tx.bodyPlacement.findUnique({ where: { id: data.bodyPlacementId } }); if (!x) throw new NotFoundError('Body Placement not found'); }

      if (data.tagIds && data.tagIds.length > 0) {
        const tags = await tx.tag.findMany({ where: { id: { in: data.tagIds } } });
        if (tags.length !== data.tagIds.length) throw new NotFoundError('One or more Tags not found');
      }

      const content = await tx.content.create({
        data: {
          slug: data.slug,
          is_featured: data.isFeatured ?? false,
          status: data.status || 'DRAFT',
          published_at: data.status === 'PUBLISHED' ? new Date() : null,
          content_type_id: data.contentTypeId,
          category_id: data.categoryId,
          collection_id: data.collectionId,
          style_id: data.styleId,
          body_placement_id: data.bodyPlacementId,
        }
      });

      const translations = [{
        content_id: content.id,
        language_code: 'en',
        title: data.translations.en.title,
        short_description: data.translations.en.shortDescription,
        description: data.translations.en.description,
        story: data.translations.en.story,
        inspiration: data.translations.en.inspiration,
        meaning: data.translations.en.meaning,
        process: data.translations.en.process,
      }];

      if (data.translations.gu) {
        translations.push({
          content_id: content.id,
          language_code: 'gu',
          title: data.translations.gu.title || '', // Wait, if title missing fallback
          short_description: data.translations.gu.shortDescription,
          description: data.translations.gu.description,
          story: data.translations.gu.story,
          inspiration: data.translations.gu.inspiration,
          meaning: data.translations.gu.meaning,
          process: data.translations.gu.process,
        });
      }

      await tx.contentTranslation.createMany({ data: translations });

      if (data.tagIds && data.tagIds.length > 0) {
        const uniqueTags = [...new Set(data.tagIds)];
        await tx.contentTag.createMany({
          data: uniqueTags.map(tagId => ({ content_id: content.id, tag_id: tagId }))
        });
      }

      return await tx.content.findUnique({ where: { id: content.id } });
    });
  }

  async updateBasic(id: string, data: UpdateContentBasicDTO) {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Content not found');

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.content.findUnique({ where: { slug: data.slug } });
      if (slugConflict) throw new AppError('A content with this slug already exists.', 409, 'CONTENT_SLUG_EXISTS');
    }

    return prisma.$transaction(async (tx) => {
      await tx.content.update({
        where: { id },
        data: {
          ...(data.slug && { slug: data.slug }),
          ...(data.isFeatured !== undefined && { is_featured: data.isFeatured }),
        },
      });

      if (data.translations) {
        for (const [lang, tData] of Object.entries(data.translations)) {
          if (tData) {
            await tx.contentTranslation.upsert({
              where: { content_id_language_code: { content_id: id, language_code: lang } },
              update: {
                ...(tData.title !== undefined && { title: tData.title }),
                ...(tData.shortDescription !== undefined && { short_description: tData.shortDescription }),
                ...(tData.description !== undefined && { description: tData.description }),
                ...(tData.story !== undefined && { story: tData.story }),
                ...(tData.inspiration !== undefined && { inspiration: tData.inspiration }),
                ...(tData.meaning !== undefined && { meaning: tData.meaning }),
                ...(tData.process !== undefined && { process: tData.process }),
              },
              create: {
                content_id: id,
                language_code: lang,
                title: tData.title!,
                short_description: tData.shortDescription,
                description: tData.description,
                story: tData.story,
                inspiration: tData.inspiration,
                meaning: tData.meaning,
                process: tData.process,
              }
            });
          }
        }
      }
      return { message: 'Basic content updated successfully' };
    });
  }

  async delete(id: string) {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Content not found');
    await prisma.content.delete({ where: { id } });
  }

  async updateMedia(id: string, data: UpdateContentMediaDTO) {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Content not found');

    return prisma.$transaction(async (tx) => {
      await tx.contentMedia.deleteMany({ where: { content_id: id } });
      if (data.media.length > 0) {
        await tx.contentMedia.createMany({
          data: data.media.map(m => ({
            content_id: id,
            role: m.role,
            media_type: m.mediaType,
            s3_key: m.s3Key,
            alt_text: m.altText,
            sort_order: m.sortOrder,
            is_active: m.isActive,
          }))
        });
      }
      return { message: 'Media updated successfully' };
    });
  }

  async updateTaxonomy(id: string, data: UpdateContentTaxonomyDTO) {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Content not found');

    return prisma.$transaction(async (tx) => {
      const ct = await tx.contentType.findUnique({ where: { id: data.contentTypeId } });
      if (!ct) throw new NotFoundError('Content Type not found');

      if (data.categoryId) { const x = await tx.category.findUnique({ where: { id: data.categoryId } }); if (!x) throw new NotFoundError('Category not found'); }
      if (data.collectionId) { const x = await tx.collection.findUnique({ where: { id: data.collectionId } }); if (!x) throw new NotFoundError('Collection not found'); }
      if (data.styleId) { const x = await tx.style.findUnique({ where: { id: data.styleId } }); if (!x) throw new NotFoundError('Style not found'); }
      if (data.bodyPlacementId) { const x = await tx.bodyPlacement.findUnique({ where: { id: data.bodyPlacementId } }); if (!x) throw new NotFoundError('Body Placement not found'); }

      if (data.tagIds && data.tagIds.length > 0) {
        const tags = await tx.tag.findMany({ where: { id: { in: data.tagIds } } });
        if (tags.length !== data.tagIds.length) throw new NotFoundError('One or more Tags not found');
      }

      await tx.content.update({
        where: { id },
        data: {
          content_type_id: data.contentTypeId,
          category_id: data.categoryId || null,
          collection_id: data.collectionId || null,
          style_id: data.styleId || null,
          body_placement_id: data.bodyPlacementId || null,
        }
      });

      await tx.contentTag.deleteMany({ where: { content_id: id } });
      if (data.tagIds && data.tagIds.length > 0) {
        const uniqueTags = [...new Set(data.tagIds)];
        await tx.contentTag.createMany({
          data: uniqueTags.map(tagId => ({ content_id: id, tag_id: tagId }))
        });
      }
      return { message: 'Taxonomy updated successfully' };
    });
  }

  async updateDisplay(id: string, data: UpdateContentDisplayDTO) {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Content not found');

    return prisma.$transaction(async (tx) => {
      await tx.contentDisplay.deleteMany({ where: { content_id: id } });
      if (data.displays.length > 0) {
        // Enforce uniqueness constraints before inserting by deduplicating input
        const map = new Map();
        data.displays.forEach(d => map.set(`${d.surface}-${d.displayType}`, d));
        const uniqueDisplays = Array.from(map.values());

        await tx.contentDisplay.createMany({
          data: uniqueDisplays.map(d => ({
            content_id: id,
            surface: d.surface,
            display_type: d.displayType,
            sort_order: d.sortOrder,
            is_active: d.isActive,
          }))
        });
      }
      return { message: 'Displays updated successfully' };
    });
  }

  async updateSeo(id: string, data: UpdateContentSeoDTO) {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Content not found');

    return prisma.$transaction(async (tx) => {
      const seo = await tx.contentSEO.upsert({
        where: { content_id: id },
        update: {
          ...(data.ogImageKey !== undefined && { og_image_key: data.ogImageKey }),
          ...(data.canonicalUrl !== undefined && { canonical_url: data.canonicalUrl }),
        },
        create: {
          content_id: id,
          og_image_key: data.ogImageKey || null,
          canonical_url: data.canonicalUrl || null,
        }
      });

      if (data.translations) {
        for (const [lang, tData] of Object.entries(data.translations)) {
          if (tData) {
            await tx.contentSEOTranslation.upsert({
              where: { content_seo_id_language_code: { content_seo_id: seo.id, language_code: lang } },
              update: {
                ...(tData.metaTitle !== undefined && { meta_title: tData.metaTitle }),
                ...(tData.metaDescription !== undefined && { meta_description: tData.metaDescription }),
                ...(tData.keywords !== undefined && { keywords: tData.keywords }),
                ...(tData.ogTitle !== undefined && { og_title: tData.ogTitle }),
                ...(tData.ogDescription !== undefined && { og_description: tData.ogDescription }),
              },
              create: {
                content_seo_id: seo.id,
                language_code: lang,
                meta_title: tData.metaTitle,
                meta_description: tData.metaDescription,
                keywords: tData.keywords,
                og_title: tData.ogTitle,
                og_description: tData.ogDescription,
              }
            });
          }
        }
      }
      return { message: 'SEO updated successfully' };
    });
  }

  async updateStatus(id: string, data: UpdateContentStatusDTO) {
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        translations: { where: { language_code: 'en' } },
        media: { where: { role: 'COVER', is_active: true } },
      }
    });

    if (!content) throw new NotFoundError('Content not found');

    if (data.status === 'PUBLISHED' && content.status !== 'PUBLISHED') {
      if (!content.translations.length || !content.translations[0]?.title) {
        throw new AppError('English title is required to publish content', 400);
      }
      if (!content.media.length) {
        throw new AppError('At least one active COVER media is required to publish content', 400);
      }
    }

    let published_at = content.published_at;
    if (data.status === 'PUBLISHED' && content.status !== 'PUBLISHED') {
      published_at = new Date();
    } else if (data.status === 'DRAFT') {
      published_at = null;
    }

    await prisma.content.update({
      where: { id },
      data: { status: data.status as any, published_at },
    });

    return { message: 'Status updated successfully' };
  }
}

export const contentService = new ContentService();
