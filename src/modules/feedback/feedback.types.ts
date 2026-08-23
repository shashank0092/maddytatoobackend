import { FeedbackStatus, FeedbackMediaType } from '@prisma/client';

export interface FeedbackTranslationInput {
  content: string;
}

export interface FeedbackMediaInput {
  mediaType: FeedbackMediaType;
  s3Key: string;
  mimeType: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateFeedbackInput {
  name: string;
  email?: string | null;
  rating: number;
  consentToPublish: boolean;
  translations: {
    en?: FeedbackTranslationInput;
    gu?: FeedbackTranslationInput;
  };
  media?: FeedbackMediaInput[];
}

export interface UpdateFeedbackInput {
  name?: string;
  email?: string | null;
  rating?: number;
  consentToPublish?: boolean;
  isVerified?: boolean;
  translations?: {
    en?: FeedbackTranslationInput;
    gu?: FeedbackTranslationInput;
  };
}

export interface UpdateFeedbackStatusInput {
  status: FeedbackStatus;
}

export interface UpdateFeedbackMediaInput {
  media: FeedbackMediaInput[];
}

export interface FeedbackListQuery {
  page?: number;
  limit?: number;
  status?: FeedbackStatus;
  rating?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  consentToPublish?: boolean;
  mediaType?: FeedbackMediaType;
  language?: 'en' | 'gu';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'submittedAt' | 'publishedAt' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}
