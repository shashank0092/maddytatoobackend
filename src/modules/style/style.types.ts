import { PaginationQuery } from '../../shared/pagination/pagination.types';

export const SUPPORTED_LANGUAGES = ['en', 'gu'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface StyleTranslationDTO {
  name: string;
  description?: string;
  altText?: string;
}

export interface CreateStyleDTO {
  slug: string;
  coverImageKey?: string;
  isActive?: boolean;
  translations: {
    en: StyleTranslationDTO;
    gu?: StyleTranslationDTO;
  };
}

export interface UpdateStyleDTO {
  slug?: string;
  coverImageKey?: string;
  isActive?: boolean;
  translations?: {
    en?: Partial<StyleTranslationDTO>;
    gu?: Partial<StyleTranslationDTO>;
  };
}

export interface StyleQueryDTO extends PaginationQuery {
  lang?: SupportedLanguage;
  search?: string;
  sort?: 'latest' | 'oldest' | 'name';
}
