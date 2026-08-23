-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');



-- CreateTable
CREATE TABLE "blogs" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "author_name" TEXT,
    "reading_time" INTEGER,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_translations" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blog_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_seo" (
    "id" UUID NOT NULL,
    "blog_id" UUID NOT NULL,
    "canonical_url" TEXT,
    "og_image_key" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blog_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_seo_translations" (
    "id" UUID NOT NULL,
    "blog_seo_id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "keywords" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "blog_seo_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_status_idx" ON "blogs"("status");

-- CreateIndex
CREATE INDEX "blogs_published_at_idx" ON "blogs"("published_at");

-- CreateIndex
CREATE INDEX "blog_translations_language_code_idx" ON "blog_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "blog_translations_blog_id_language_code_key" ON "blog_translations"("blog_id", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "blog_seo_blog_id_key" ON "blog_seo"("blog_id");

-- CreateIndex
CREATE INDEX "blog_seo_translations_language_code_idx" ON "blog_seo_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "blog_seo_translations_blog_seo_id_language_code_key" ON "blog_seo_translations"("blog_seo_id", "language_code");

-- AddForeignKey
ALTER TABLE "blog_translations" ADD CONSTRAINT "blog_translations_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_seo" ADD CONSTRAINT "blog_seo_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_seo_translations" ADD CONSTRAINT "blog_seo_translations_blog_seo_id_fkey" FOREIGN KEY ("blog_seo_id") REFERENCES "blog_seo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

