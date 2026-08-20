import { PaginationQuery } from '../../shared/pagination/pagination.types';

export const SUPPORTED_LANGUAGES = ['en', 'gu'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface BodyPlacementTranslationDTO {
  name: string;
  description?: string;
  altText?: string;
}

export interface CreateBodyPlacementDTO {
  slug: string;
  coverImageKey?: string;
  isActive?: boolean;
  translations: {
    en: BodyPlacementTranslationDTO;
    gu?: BodyPlacementTranslationDTO;
  };
}

export interface UpdateBodyPlacementDTO {
  slug?: string;
  coverImageKey?: string;
  isActive?: boolean;
  translations?: {
    en?: Partial<BodyPlacementTranslationDTO>;
    gu?: Partial<BodyPlacementTranslationDTO>;
  };
}

export interface BodyPlacementQueryDTO extends PaginationQuery {
  lang?: SupportedLanguage;
  search?: string;
  sort?: 'latest' | 'oldest' | 'name';
}
