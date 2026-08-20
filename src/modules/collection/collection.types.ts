import { PaginationQuery } from '../../shared/pagination/pagination.types';

export const SUPPORTED_LANGUAGES = ['en', 'gu'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface CollectionTranslationDTO {
  name: string;
  description?: string;
  altText?: string;
}

export interface CreateCollectionDTO {
  slug: string;
  coverImageKey?: string;
  isActive?: boolean;
  translations: {
    en: CollectionTranslationDTO;
    gu?: CollectionTranslationDTO;
  };
}

export interface UpdateCollectionDTO {
  slug?: string;
  coverImageKey?: string;
  isActive?: boolean;
  translations?: {
    en?: Partial<CollectionTranslationDTO>;
    gu?: Partial<CollectionTranslationDTO>;
  };
}

export interface CollectionQueryDTO extends PaginationQuery {
  lang?: SupportedLanguage;
  search?: string;
  sort?: 'latest' | 'oldest' | 'name';
}
