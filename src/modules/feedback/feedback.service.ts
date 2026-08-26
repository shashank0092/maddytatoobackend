import { PrismaClient, Prisma, FeedbackStatus, FeedbackMediaType } from '@prisma/client';
import { CreateFeedbackInput, UpdateFeedbackInput, UpdateFeedbackStatusInput, UpdateFeedbackMediaInput, FeedbackListQuery } from './feedback.types';

const prisma = new PrismaClient();

export class FeedbackService {
  /**
   * 1. Create Feedback (PUBLIC)
   */
  async create(data: CreateFeedbackInput) {
    return await prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.create({
        data: {
          name: data.name,
          email: data.email || null,
          rating: data.rating,
          consent_to_publish: data.consentToPublish,
          status: 'PENDING',
          is_featured: false,
          is_verified: false,
          published_at: null,
        },
      });

      const translationData = [];
      if (data.translations.en) {
        translationData.push({
          feedback_id: feedback.id,
          language_code: 'en',
          content: data.translations.en.content,
        });
      }
      if (data.translations.gu) {
        translationData.push({
          feedback_id: feedback.id,
          language_code: 'gu',
          content: data.translations.gu.content,
        });
      }

      if (translationData.length > 0) {
        await tx.feedbackTranslation.createMany({
          data: translationData,
        });
      }

      if (data.media && data.media.length > 0) {
        const mediaData = data.media.map((m) => ({
          feedback_id: feedback.id,
          media_type: m.mediaType,
          s3_key: m.s3Key,
          mime_type: m.mimeType,
          sort_order: m.sortOrder ?? 0,
          is_active: m.isActive ?? true,
        }));
        await tx.feedbackMedia.createMany({
          data: mediaData,
        });
      }

      return tx.feedback.findUnique({
        where: { id: feedback.id },
        include: {
          translations: true,
          media: true,
        },
      });
    });
  }

  /**
   * 2. List Feedback
   */
  async getAll(query: FeedbackListQuery, isAdmin: boolean) {
    const {
      page = 1,
      limit = 10,
      status,
      rating,
      isFeatured,
      isVerified,
      consentToPublish,
      mediaType,
      language = 'en',
      search,
      sortBy,
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.FeedbackWhereInput = {};

    if (!isAdmin) {
      // Public view restrictions
      where.status = 'APPROVED';
      where.consent_to_publish = true;
      if (isFeatured !== undefined) where.is_featured = isFeatured;
      if (isVerified !== undefined) where.is_verified = isVerified;
      if (rating !== undefined) where.rating = rating;
    } else {
      // Admin view
      if (status) where.status = status;
      if (isFeatured !== undefined) where.is_featured = isFeatured;
      if (isVerified !== undefined) where.is_verified = isVerified;
      if (consentToPublish !== undefined) where.consent_to_publish = consentToPublish;
      if (rating !== undefined) where.rating = rating;
    }

    if (mediaType) {
      where.media = {
        some: {
          media_type: mediaType,
          is_active: true,
        },
      };
    }

    if (search) {
      const searchFilter = { contains: search, mode: 'insensitive' as Prisma.QueryMode };
      where.OR = [
        { name: searchFilter },
        { translations: { some: { content: searchFilter } } }
      ];
    }

    let orderBy: Prisma.FeedbackOrderByWithRelationInput | Prisma.FeedbackOrderByWithRelationInput[] = [];

    if (!isAdmin && !sortBy) {
      // Public default sort
      orderBy = [
        { is_featured: 'desc' },
        { published_at: 'desc' },
        { created_at: 'desc' },
      ];
    } else if (isAdmin && !sortBy) {
      // Admin default sort
      orderBy = { created_at: 'desc' };
    } else if (sortBy) {
      // Requested sort
      const dir = sortOrder === 'asc' ? 'asc' : 'desc';
      switch (sortBy) {
        case 'createdAt': orderBy = { created_at: dir }; break;
        case 'updatedAt': orderBy = { updated_at: dir }; break;
        case 'submittedAt': orderBy = { submitted_at: dir }; break;
        case 'publishedAt': orderBy = { published_at: dir }; break;
        case 'rating': orderBy = { rating: dir }; break;
        case 'name': orderBy = { name: dir }; break;
        default: orderBy = { created_at: 'desc' };
      }
    }

    const [total, feedbacks] = await prisma.$transaction([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          translations: {
            where: isAdmin ? undefined : { language_code: language },
          },
          media: {
            where: isAdmin ? undefined : { is_active: true },
            orderBy: { sort_order: 'asc' },
          },
        },
      }),
    ]);

    // For public lists, we map exactly the required output
    let data;
    if (!isAdmin) {
      data = feedbacks.map(fb => {
        // Fallback to English if requested language not found
        let translation = fb.translations.find(t => t.language_code === language);
        if (!translation) {
           translation = fb.translations.find(t => t.language_code === 'en');
        }

        return {
          id: fb.id,
          name: fb.name,
          rating: fb.rating,
          isFeatured: fb.is_featured,
          isVerified: fb.is_verified,
          publishedAt: fb.published_at,
          translation: translation ? {
            languageCode: translation.language_code,
            content: translation.content
          } : null,
          media: fb.media.map(m => ({
            mediaType: m.media_type,
            s3Key: m.s3_key,
            mimeType: m.mime_type,
            sortOrder: m.sort_order,
          }))
        };
      });
    } else {
      // In admin view, we want to see the fallback language logic without omitting internal fields
      // But we just return the raw record since they need to manage it all
      data = feedbacks;
    }

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * 3. Get Feedback by ID
   */
  async getById(id: string, isAdmin: boolean, language: string = 'en') {
    const where: Prisma.FeedbackWhereInput = { id };

    if (!isAdmin) {
      where.status = 'APPROVED';
      where.consent_to_publish = true;
    }

    const feedback = await prisma.feedback.findFirst({
      where,
      include: {
        translations: true,
        media: {
          where: isAdmin ? undefined : { is_active: true },
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    if (!feedback) {
      return null; // Controller will throw 404
    }

    if (!isAdmin) {
      let translation = feedback.translations.find(t => t.language_code === language);
      if (!translation) {
        translation = feedback.translations.find(t => t.language_code === 'en');
      }

      return {
        id: feedback.id,
        name: feedback.name,
        rating: feedback.rating,
        isFeatured: feedback.is_featured,
        isVerified: feedback.is_verified,
        publishedAt: feedback.published_at,
        translation: translation ? {
          languageCode: translation.language_code,
          content: translation.content
        } : null,
        media: feedback.media.map(m => ({
          mediaType: m.media_type,
          s3Key: m.s3_key,
          mimeType: m.mime_type,
          sortOrder: m.sort_order,
        })),
      };
    }

    return feedback;
  }

  /**
   * 4. Update Feedback (General, Admin Only)
   */
  async update(id: string, data: UpdateFeedbackInput) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.feedback.findUnique({ where: { id } });
      if (!existing) {
        throw new Error('FEEDBACK_NOT_FOUND');
      }

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.rating !== undefined) updateData.rating = data.rating;
      if (data.consentToPublish !== undefined) updateData.consent_to_publish = data.consentToPublish;
      if (data.isVerified !== undefined) updateData.is_verified = data.isVerified;

      if (data.isFeatured !== undefined) {
        if (data.isFeatured && (existing.status !== 'APPROVED' || !(data.consentToPublish ?? existing.consent_to_publish))) {
          throw new Error('CONSENT_REQUIRED_FOR_FEATURED');
        }
        updateData.is_featured = data.isFeatured;
      }

      // Handle consent change side-effects
      if (data.consentToPublish === false && existing.is_featured) {
         updateData.is_featured = false;
      }

      await tx.feedback.update({
        where: { id },
        data: updateData,
      });

      if (data.translations) {
        for (const [lang, translationData] of Object.entries(data.translations)) {
          if (translationData) {
            await tx.feedbackTranslation.upsert({
              where: {
                feedback_id_language_code: {
                  feedback_id: id,
                  language_code: lang,
                },
              },
              update: {
                content: translationData.content,
              },
              create: {
                feedback_id: id,
                language_code: lang,
                content: translationData.content,
              },
            });
          }
        }
      }

      return tx.feedback.findUnique({
        where: { id },
        include: { translations: true, media: true },
      });
    });
  }

  /**
   * 5. Moderate Feedback Status (Admin Only)
   */
  async updateStatus(id: string, data: UpdateFeedbackStatusInput) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.feedback.findUnique({ where: { id } });
      if (!existing) {
        throw new Error('FEEDBACK_NOT_FOUND');
      }

      const newStatus = data.status;
      const updateData: any = { status: newStatus };

      if (newStatus === 'APPROVED') {
        if (!existing.consent_to_publish) {
          throw new Error('CONSENT_REQUIRED');
        }
        updateData.published_at = existing.published_at || new Date();
      } else {
        // PENDING, REJECTED, ARCHIVED
        if (existing.is_featured) {
          updateData.is_featured = false;
        }
        if (newStatus === 'REJECTED' || newStatus === 'ARCHIVED' || newStatus === 'PENDING') {
           updateData.published_at = null; // Unpublish
        }
      }

      return await tx.feedback.update({
        where: { id },
        data: updateData,
        include: { translations: true, media: true },
      });
    });
  }

  /**
   * 6. Manage Media (Admin Only)
   */
  async updateMedia(id: string, data: UpdateFeedbackMediaInput) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.feedback.findUnique({ where: { id } });
      if (!existing) {
        throw new Error('FEEDBACK_NOT_FOUND');
      }

      // Delete existing media references
      await tx.feedbackMedia.deleteMany({
        where: { feedback_id: id },
      });

      // Insert new media references
      if (data.media && data.media.length > 0) {
        const mediaData = data.media.map((m) => ({
          feedback_id: id,
          media_type: m.mediaType,
          s3_key: m.s3Key,
          mime_type: m.mimeType,
          sort_order: m.sortOrder ?? 0,
          is_active: m.isActive ?? true,
        }));
        await tx.feedbackMedia.createMany({
          data: mediaData,
        });
      }

      return tx.feedback.findUnique({
        where: { id },
        include: { media: true },
      });
    });
  }

  /**
   * 7. Delete Feedback (Admin Only)
   */
  async delete(id: string) {
    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('FEEDBACK_NOT_FOUND');
    }

    await prisma.feedback.delete({ where: { id } });
    return true;
  }
}

export const feedbackService = new FeedbackService();
