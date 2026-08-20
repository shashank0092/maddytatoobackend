import { PaginationQuery } from '../../shared/pagination/pagination.types';

export const SUPPORTED_LANGUAGES = ['en', 'gu'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface TranslationDTO {
  name: string;
  description?: string;
  altText?: string;
}

export interface CreateContentTypeDTO {
  slug: string;
  coverImageKey?: string;
  isActive?: boolean;
  translations: {
    en: TranslationDTO;
    gu?: TranslationDTO;
  };
}

export interface UpdateContentTypeDTO {
  slug?: string;
  coverImageKey?: string;
  isActive?: boolean;
  translations?: {
    en?: Partial<TranslationDTO>;
    gu?: Partial<TranslationDTO>;
  };
}

export interface ContentTypeQueryDTO extends PaginationQuery {
  lang?: SupportedLanguage;
  search?: string;
  sort?: 'latest' | 'oldest' | 'name';
}
