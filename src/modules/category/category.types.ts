import { PaginationQuery } from '../../shared/pagination/pagination.types';

export const SUPPORTED_LANGUAGES = ['en', 'gu'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface CategoryTranslationDTO {
  name: string;
  description?: string;
  altText?: string;
}

export interface CreateCategoryDTO {
  slug: string;
  coverImageKey?: string;
  isActive?: boolean;
  translations: {
    en: CategoryTranslationDTO;
    gu?: CategoryTranslationDTO;
  };
}

export interface UpdateCategoryDTO {
  slug?: string;
  coverImageKey?: string;
  isActive?: boolean;
  translations?: {
    en?: Partial<CategoryTranslationDTO>;
    gu?: Partial<CategoryTranslationDTO>;
  };
}

export interface CategoryQueryDTO extends PaginationQuery {
  lang?: SupportedLanguage;
  search?: string;
  sort?: 'latest' | 'oldest' | 'name';
}
