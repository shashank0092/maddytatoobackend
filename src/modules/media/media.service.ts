import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../core/errors/AppError';
import { CreateMediaPayload, UpdateMediaPayload } from './media.types';

export class MediaService {
  async createMediaReference(data: CreateMediaPayload) {
    const content = await prisma.content.findUnique({
      where: { id: data.contentId },
    });

    if (!content) {
      throw new NotFoundError('Content not found');
    }

    // Determine if we are creating an active COVER
    const isNewActiveCover = data.role === 'COVER' && data.isActive !== false;

    return await prisma.$transaction(async (tx) => {
      // If this is a new active cover, deactivate the existing active cover for this content
      if (isNewActiveCover) {
        await tx.contentMedia.updateMany({
          where: {
            content_id: data.contentId,
            role: 'COVER',
            is_active: true,
          },
          data: {
            is_active: false,
          },
        });
      }

      // Create the media reference
      const newMedia = await tx.contentMedia.create({
        data: {
          content_id: data.contentId,
          s3_key: data.s3Key,
          media_type: data.mediaType,
          role: data.role,
          sort_order: data.sortOrder ?? 0,
          is_active: data.isActive ?? true,
        },
      });

      // Handle translations
      const translationPromises = [];
      if (data.translations?.en) {
        translationPromises.push(
          tx.contentMediaTranslation.create({
            data: {
              media_id: newMedia.id,
              language_code: 'en',
              alt_text: data.translations.en.altText,
            },
          })
        );
      }
      if (data.translations?.gu) {
        translationPromises.push(
          tx.contentMediaTranslation.create({
            data: {
              media_id: newMedia.id,
              language_code: 'gu',
              alt_text: data.translations.gu.altText,
            },
          })
        );
      }

      await Promise.all(translationPromises);

      // Return the complete object
      return tx.contentMedia.findUnique({
        where: { id: newMedia.id },
        include: { translations: true },
      });
    });
  }

  async updateMedia(id: string, data: UpdateMediaPayload) {
    const existingMedia = await prisma.contentMedia.findUnique({
      where: { id },
    });

    if (!existingMedia) {
      throw new NotFoundError('Media not found');
    }

    const newRole = data.role ?? existingMedia.role;
    const newIsActive = data.isActive ?? existingMedia.is_active;
    const isNewActiveCover = newRole === 'COVER' && newIsActive === true;

    return await prisma.$transaction(async (tx) => {
      // If this media becomes an active cover, deactivate others for the same content
      if (isNewActiveCover) {
        await tx.contentMedia.updateMany({
          where: {
            content_id: existingMedia.content_id,
            role: 'COVER',
            is_active: true,
            id: { not: id }, // Don't deactivate the one we are updating
          },
          data: {
            is_active: false,
          },
        });
      }

      const updatedMedia = await tx.contentMedia.update({
        where: { id },
        data: {
          ...(data.role !== undefined && { role: data.role }),
          ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
          ...(data.isActive !== undefined && { is_active: data.isActive }),
        },
      });

      // Handle translations
      const translationPromises = [];
      if (data.translations?.en !== undefined) {
        translationPromises.push(
          tx.contentMediaTranslation.upsert({
            where: {
              media_id_language_code: {
                media_id: id,
                language_code: 'en',
              },
            },
            update: {
              alt_text: data.translations.en.altText,
            },
            create: {
              media_id: id,
              language_code: 'en',
              alt_text: data.translations.en.altText,
            },
          })
        );
      }
      
      if (data.translations?.gu !== undefined) {
        translationPromises.push(
          tx.contentMediaTranslation.upsert({
            where: {
              media_id_language_code: {
                media_id: id,
                language_code: 'gu',
              },
            },
            update: {
              alt_text: data.translations.gu.altText,
            },
            create: {
              media_id: id,
              language_code: 'gu',
              alt_text: data.translations.gu.altText,
            },
          })
        );
      }

      await Promise.all(translationPromises);

      return tx.contentMedia.findUnique({
        where: { id },
        include: { translations: true },
      });
    });
  }

  async deleteMedia(id: string) {
    const existingMedia = await prisma.contentMedia.findUnique({
      where: { id },
    });

    if (!existingMedia) {
      throw new NotFoundError('Media not found');
    }

    // Due to ON DELETE CASCADE on the Prisma schema, we just delete the media record.
    await prisma.contentMedia.delete({
      where: { id },
    });

    return { message: 'Media deleted successfully.' };
  }
}
