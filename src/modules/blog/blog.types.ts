export type SupportedLanguage = 'en' | 'gu';

export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface BlogQueryDTO {
  page?: string | number;
  limit?: string | number;
  language?: SupportedLanguage;
  search?: string;
  status?: BlogStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'readingTime';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogTranslationDTO {
  title: string;
  excerpt?: string;
  content: string;
}

export interface CreateBlogDTO {
  slug: string;
  authorName?: string;
  readingTime?: number;
  translations: {
    en: BlogTranslationDTO;
    gu?: Partial<BlogTranslationDTO>;
  };
  seo?: UpdateBlogSeoDTO;
}

export interface UpdateBlogBasicDTO {
  slug?: string;
  authorName?: string;
  readingTime?: number;
  translations?: {
    en?: Partial<BlogTranslationDTO>;
    gu?: Partial<BlogTranslationDTO>;
  };
}

export interface BlogSeoTranslationDTO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export interface UpdateBlogSeoDTO {
  canonicalUrl?: string | null;
  ogImageKey?: string | null;
  translations?: {
    en?: Partial<BlogSeoTranslationDTO>;
    gu?: Partial<BlogSeoTranslationDTO>;
  };
}

export interface UpdateBlogStatusDTO {
  status: BlogStatus;
}

export interface UpdateBlogMediaDTO {
  coverMediaKey?: string | null;
}
