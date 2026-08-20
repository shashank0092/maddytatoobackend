import { PaginationQuery } from '../../shared/pagination/pagination.types';

export const SUPPORTED_LANGUAGES = ['en', 'gu'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface TagTranslationDTO {
  name: string;
}

export interface CreateTagDTO {
  slug: string;
  isActive?: boolean;
  translations: {
    en: TagTranslationDTO;
    gu?: TagTranslationDTO;
  };
}

export interface UpdateTagDTO {
  slug?: string;
  isActive?: boolean;
  translations?: {
    en?: Partial<TagTranslationDTO>;
    gu?: Partial<TagTranslationDTO>;
  };
}

export interface TagQueryDTO extends PaginationQuery {
  lang?: SupportedLanguage;
  search?: string;
  sort?: 'latest' | 'oldest' | 'name';
}
