import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../../core/errors/AppError';
import { sanitizeBlogHtml } from './blog.utils';
import {
  CreateBlogDTO,
  BlogQueryDTO,
  SupportedLanguage,
  UpdateBlogBasicDTO,
  UpdateBlogStatusDTO,
  UpdateBlogSeoDTO,
  UpdateBlogMediaDTO,
} from './blog.types';

export const blogService = {
  async create(data: CreateBlogDTO) {
    const { slug, isFeatured, authorName, readingTime, translations, seo } = data;

    // Ensure English is present (Zod also does this, but sanity check)
    if (!translations.en || !translations.en.title || !translations.en.content) {
      throw new ValidationError('English translation with title and content is required');
    }

    // Sanitize HTML
    translations.en.content = sanitizeBlogHtml(translations.en.content);
    if (translations.gu?.content) {
      translations.gu.content = sanitizeBlogHtml(translations.gu.content);
    }

    try {
      const blog = await prisma.$transaction(async (tx) => {
        const newBlog = await tx.blog.create({
          data: {
            slug,
            is_featured: isFeatured ?? false,
            author_name: authorName,
            reading_time: readingTime,
            status: 'DRAFT', // Default new blogs to DRAFT
          },
        });

        // English translation
        await tx.blogTranslation.create({
          data: {
            blog_id: newBlog.id,
            language_code: 'en',
            title: translations.en.title,
            excerpt: translations.en.excerpt,
            content: translations.en.content,
          },
        });

        // Gujarati translation (optional)
        if (translations.gu && translations.gu.title && translations.gu.content) {
          await tx.blogTranslation.create({
            data: {
              blog_id: newBlog.id,
              language_code: 'gu',
              title: translations.gu.title,
              excerpt: translations.gu.excerpt,
              content: translations.gu.content,
            },
          });
        }

        // SEO
        if (seo) {
          const newSeo = await tx.blogSeo.create({
            data: {
              blog_id: newBlog.id,
              canonical_url: seo.canonicalUrl,
              og_image_key: seo.ogImageKey,
            },
          });

          if (seo.translations?.en) {
            await tx.blogSeoTranslation.create({
              data: {
                blog_seo_id: newSeo.id,
                language_code: 'en',
                meta_title: seo.translations.en.metaTitle,
                meta_description: seo.translations.en.metaDescription,
                keywords: seo.translations.en.keywords,
                og_title: seo.translations.en.ogTitle,
                og_description: seo.translations.en.ogDescription,
              },
            });
          }

          if (seo.translations?.gu) {
            await tx.blogSeoTranslation.create({
              data: {
                blog_seo_id: newSeo.id,
                language_code: 'gu',
                meta_title: seo.translations.gu.metaTitle,
                meta_description: seo.translations.gu.metaDescription,
                keywords: seo.translations.gu.keywords,
                og_title: seo.translations.gu.ogTitle,
                og_description: seo.translations.gu.ogDescription,
              },
            });
          }
        }

        return newBlog;
      });

      return { id: blog.id, slug: blog.slug };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('BLOG_SLUG_ALREADY_EXISTS');
      }
      throw error;
    }
  },

  async getAll(query: BlogQueryDTO, isAdmin: boolean) {
    const { page = 1, limit = 10, language, search, status, isFeatured, sortBy, sortOrder } = query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const targetLang = language || 'en';

    const where: Prisma.BlogWhereInput = {};

    // Apply status filter based on admin/public access
    if (isAdmin) {
      if (status) {
        where.status = status;
      }
    } else {
      // Public is ONLY allowed to see PUBLISHED
      where.status = 'PUBLISHED';
    }

    if (isFeatured !== undefined) {
      where.is_featured = isFeatured as boolean;
    }

    // Apply search filter (against translations)
    if (search) {
      where.translations = {
        some: {
          language_code: targetLang,
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    } else if (language) {
      // Just filter by existence of translation if language explicitly requested
      where.translations = {
        some: {
          language_code: targetLang,
        },
      };
    }

    // Apply sorting securely mapped to Prisma fields
    const orderBy: Prisma.BlogOrderByWithRelationInput[] = [];

    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    if (sortBy) {
      switch (sortBy) {
        case 'createdAt':
          orderBy.push({ created_at: order });
          break;
        case 'updatedAt':
          orderBy.push({ updated_at: order });
          break;
        case 'publishedAt':
          orderBy.push({ published_at: order });
          break;
        case 'readingTime':
          orderBy.push({ reading_time: order });
          break;
        case 'title':
          // We can only reliably sort by title if we join or rely on primary lang.
          // Since sorting by deep relations is tricky in Prisma, we'll sort by the English translation title if requested.
          orderBy.push({
            translations: {
              _count: order, // Fallback/hack. True multi-lang sort requires a separate structure.
            },
          });
          break;
      }
    }

    // Default stable sort
    if (orderBy.length === 0) {
      orderBy.push({ published_at: 'desc' });
      orderBy.push({ id: 'desc' }); // deterministic fallback
    }

    const [total, blogs] = await prisma.$transaction([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          translations: {
            where: {
              // Try to fetch the requested language, or fallback to english in code
              language_code: { in: [targetLang, 'en'] },
            },
          },
        },
      }),
    ]);

    const data = blogs.map((b) => {
      // Find exact requested language or fallback to en
      let trans = b.translations.find((t) => t.language_code === targetLang);
      if (!trans) {
        trans = b.translations.find((t) => t.language_code === 'en');
      }

      return {
        id: b.id,
        slug: b.slug,
        status: b.status,
        isFeatured: b.is_featured,
        authorName: b.author_name,
        readingTime: b.reading_time,
        publishedAt: b.published_at,
        translation: trans
          ? {
              languageCode: trans.language_code,
              title: trans.title,
              excerpt: trans.excerpt,
            }
          : null,
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    return {
      data,
      meta: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      },
    };
  },

  async getBySlug(slug: string, language: SupportedLanguage | undefined, isAdmin: boolean) {
    const targetLang = language || 'en';

    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: {
        translations: {
          where: {
            language_code: { in: [targetLang, 'en'] },
          },
        },
        seo: {
          include: {
            translations: {
              where: {
                language_code: { in: [targetLang, 'en'] },
              },
            },
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundError('BLOG_NOT_FOUND');
    }

    if (!isAdmin && blog.status !== 'PUBLISHED') {
      throw new NotFoundError('BLOG_NOT_FOUND'); // Don't leak draft status to public
    }

    let trans = blog.translations.find((t) => t.language_code === targetLang);
    if (!trans) {
      trans = blog.translations.find((t) => t.language_code === 'en');
    }

    let seoTrans = null;
    if (blog.seo) {
      seoTrans = blog.seo.translations.find((t) => t.language_code === targetLang);
      if (!seoTrans) {
        seoTrans = blog.seo.translations.find((t) => t.language_code === 'en');
      }
    }

    return {
      id: blog.id,
      slug: blog.slug,
      status: blog.status,
      isFeatured: blog.is_featured,
      authorName: blog.author_name,
      readingTime: blog.reading_time,
      publishedAt: blog.published_at,
      translation: trans
        ? {
            languageCode: trans.language_code,
            title: trans.title,
            excerpt: trans.excerpt,
            content: trans.content, // HTML string, already sanitized
          }
        : null,
      seo: blog.seo
        ? {
            canonicalUrl: blog.seo.canonical_url,
            ogImageKey: blog.seo.og_image_key,
            translation: seoTrans
              ? {
                  languageCode: seoTrans.language_code,
                  metaTitle: seoTrans.meta_title,
                  metaDescription: seoTrans.meta_description,
                  keywords: seoTrans.keywords,
                  ogTitle: seoTrans.og_title,
                  ogDescription: seoTrans.og_description,
                }
              : null,
          }
        : null,
    };
  },

  async updateBasic(id: string, data: UpdateBlogBasicDTO) {
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('BLOG_NOT_FOUND');
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Update root blog properties
        if (data.slug !== undefined || data.authorName !== undefined || data.readingTime !== undefined || data.isFeatured !== undefined) {
          await tx.blog.update({
            where: { id },
            data: {
              ...(data.slug !== undefined && { slug: data.slug }),
              ...(data.isFeatured !== undefined && { is_featured: data.isFeatured }),
              ...(data.authorName !== undefined && { author_name: data.authorName }),
              ...(data.readingTime !== undefined && { reading_time: data.readingTime }),
            },
          });
        }

        // Update translations
        if (data.translations?.en) {
          const en = data.translations.en;
          await tx.blogTranslation.upsert({
            where: { blog_id_language_code: { blog_id: id, language_code: 'en' } },
            update: {
              ...(en.title !== undefined && { title: en.title }),
              ...(en.excerpt !== undefined && { excerpt: en.excerpt }),
              ...(en.content !== undefined && { content: sanitizeBlogHtml(en.content) }),
            },
            create: {
              blog_id: id,
              language_code: 'en',
              title: en.title || '',
              excerpt: en.excerpt,
              content: en.content ? sanitizeBlogHtml(en.content) : '',
            },
          });
        }

        if (data.translations?.gu) {
          const gu = data.translations.gu;
          await tx.blogTranslation.upsert({
            where: { blog_id_language_code: { blog_id: id, language_code: 'gu' } },
            update: {
              ...(gu.title !== undefined && { title: gu.title }),
              ...(gu.excerpt !== undefined && { excerpt: gu.excerpt }),
              ...(gu.content !== undefined && { content: sanitizeBlogHtml(gu.content) }),
            },
            create: {
              blog_id: id,
              language_code: 'gu',
              title: gu.title || '',
              excerpt: gu.excerpt,
              content: gu.content ? sanitizeBlogHtml(gu.content) : '',
            },
          });
        }
      });

      return { success: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('BLOG_SLUG_ALREADY_EXISTS');
      }
      throw error;
    }
  },

  async updateStatus(id: string, data: UpdateBlogStatusDTO) {
    const existing = await prisma.blog.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existing) {
      throw new NotFoundError('BLOG_NOT_FOUND');
    }

    const enTranslation = existing.translations.find((t) => t.language_code === 'en');

    if (data.status === 'PUBLISHED') {
      if (!enTranslation || !enTranslation.title || !enTranslation.content) {
        throw new ValidationError('BLOG_NOT_PUBLISHABLE: Missing English title or content');
      }
    }

    let newPublishedAt = existing.published_at;

    if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      newPublishedAt = new Date();
    } else if (data.status === 'DRAFT') {
      newPublishedAt = null;
    }

    await prisma.blog.update({
      where: { id },
      data: {
        status: data.status,
        published_at: newPublishedAt,
      },
    });

    return { success: true };
  },

  async updateSeo(id: string, data: UpdateBlogSeoDTO) {
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('BLOG_NOT_FOUND');
    }

    await prisma.$transaction(async (tx) => {
      const seo = await tx.blogSeo.upsert({
        where: { blog_id: id },
        update: {
          ...(data.canonicalUrl !== undefined && { canonical_url: data.canonicalUrl }),
          ...(data.ogImageKey !== undefined && { og_image_key: data.ogImageKey }),
        },
        create: {
          blog_id: id,
          canonical_url: data.canonicalUrl,
          og_image_key: data.ogImageKey,
        },
      });

      if (data.translations?.en) {
        const en = data.translations.en;
        await tx.blogSeoTranslation.upsert({
          where: { blog_seo_id_language_code: { blog_seo_id: seo.id, language_code: 'en' } },
          update: {
            ...(en.metaTitle !== undefined && { meta_title: en.metaTitle }),
            ...(en.metaDescription !== undefined && { meta_description: en.metaDescription }),
            ...(en.keywords !== undefined && { keywords: en.keywords }),
            ...(en.ogTitle !== undefined && { og_title: en.ogTitle }),
            ...(en.ogDescription !== undefined && { og_description: en.ogDescription }),
          },
          create: {
            blog_seo_id: seo.id,
            language_code: 'en',
            meta_title: en.metaTitle,
            meta_description: en.metaDescription,
            keywords: en.keywords,
            og_title: en.ogTitle,
            og_description: en.ogDescription,
          },
        });
      }

      if (data.translations?.gu) {
        const gu = data.translations.gu;
        await tx.blogSeoTranslation.upsert({
          where: { blog_seo_id_language_code: { blog_seo_id: seo.id, language_code: 'gu' } },
          update: {
            ...(gu.metaTitle !== undefined && { meta_title: gu.metaTitle }),
            ...(gu.metaDescription !== undefined && { meta_description: gu.metaDescription }),
            ...(gu.keywords !== undefined && { keywords: gu.keywords }),
            ...(gu.ogTitle !== undefined && { og_title: gu.ogTitle }),
            ...(gu.ogDescription !== undefined && { og_description: gu.ogDescription }),
          },
          create: {
            blog_seo_id: seo.id,
            language_code: 'gu',
            meta_title: gu.metaTitle,
            meta_description: gu.metaDescription,
            keywords: gu.keywords,
            og_title: gu.ogTitle,
            og_description: gu.ogDescription,
          },
        });
      }
    });

    return { success: true };
  },

  async updateMedia(id: string, data: UpdateBlogMediaDTO) {
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('BLOG_NOT_FOUND');
    }

    await prisma.blog.update({
      where: { id },
      data: {
        cover_media_key: data.coverMediaKey,
      },
    });

    return { success: true };
  },

  async delete(id: string) {
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('BLOG_NOT_FOUND');
    }

    await prisma.blog.delete({ where: { id } });
    return { success: true };
  },
};
