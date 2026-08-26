export type SupportedLanguage = 'en' | 'gu';

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type MediaType = 'IMAGE' | 'VIDEO';

export type MediaRole = 'COVER' | 'GALLERY' | 'PROCESS' | 'VIDEO';

export type DisplaySurface = 'HOME' | 'DISCOVER' | 'MUSEUM' | 'COMMUNITY';

export type DisplayType = 'FEATURED' | 'LATEST' | 'EDITOR_PICK' | 'SPOTLIGHT';

export interface ContentQueryDTO {
  page?: string | number;
  limit?: string | number;
  lang?: SupportedLanguage;
  search?: string;
  contentType?: string;
  category?: string;
  collection?: string;
  style?: string;
  bodyPlacement?: string;
  tag?: string;
  status?: string;
  isFeatured?: boolean | string;
  sort?: 'latest' | 'oldest' | 'title';
}

export interface ContentTranslationDTO {
  title: string;
  shortDescription?: string;
  description?: string;
  story?: string;
  inspiration?: string;
  meaning?: string;
  process?: string;
}

export interface CreateContentDTO {
  slug: string;
  isFeatured?: boolean;
  contentTypeId: string;
  categoryId?: string | null;
  collectionId?: string | null;
  styleId?: string | null;
  bodyPlacementId?: string | null;
  status?: ContentStatus;
  translations: {
    en: ContentTranslationDTO;
    gu?: Partial<ContentTranslationDTO>;
  };
  tagIds?: string[];
}

export interface UpdateContentBasicDTO {
  slug?: string;
  isFeatured?: boolean;
  translations?: {
    en?: Partial<ContentTranslationDTO>;
    gu?: Partial<ContentTranslationDTO>;
  };
}

export interface UpdateContentMediaDTO {
  media: {
    role: MediaRole;
    mediaType: MediaType;
    s3Key: string;
    altText?: string | null;
    sortOrder: number;
    isActive: boolean;
  }[];
}

export interface UpdateContentTaxonomyDTO {
  contentTypeId: string;
  categoryId?: string | null;
  collectionId?: string | null;
  styleId?: string | null;
  bodyPlacementId?: string | null;
  tagIds: string[];
}

export interface UpdateContentDisplayDTO {
  displays: {
    surface: DisplaySurface;
    displayType: DisplayType;
    sortOrder: number;
    isActive: boolean;
  }[];
}

export interface ContentSEOTRanslationDTO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export interface UpdateContentSeoDTO {
  ogImageKey?: string | null;
  canonicalUrl?: string | null;
  translations?: {
    en?: Partial<ContentSEOTRanslationDTO>;
    gu?: Partial<ContentSEOTRanslationDTO>;
  };
}

export interface UpdateContentStatusDTO {
  status: ContentStatus;
}
