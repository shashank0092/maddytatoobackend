import { MediaRole, MediaType } from '@prisma/client';

export interface CreateMediaTranslationPayload {
  altText?: string | null;
}

export interface CreateMediaPayload {
  contentId: string;
  s3Key: string;
  mediaType: MediaType;
  role: MediaRole;
  sortOrder?: number;
  isActive?: boolean;
  translations?: {
    en?: CreateMediaTranslationPayload;
    gu?: CreateMediaTranslationPayload;
  };
}

export interface UpdateMediaPayload {
  role?: MediaRole;
  sortOrder?: number;
  isActive?: boolean;
  translations?: {
    en?: CreateMediaTranslationPayload;
    gu?: CreateMediaTranslationPayload;
  };
}
