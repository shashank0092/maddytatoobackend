-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "MediaRole" AS ENUM ('COVER', 'GALLERY', 'PROCESS', 'VIDEO');

-- CreateEnum
CREATE TYPE "DisplaySurface" AS ENUM ('HOME', 'DISCOVER', 'MUSEUM', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "DisplayType" AS ENUM ('FEATURED', 'LATEST', 'EDITOR_PICK', 'SPOTLIGHT');

-- CreateTable
CREATE TABLE "contents" (
    "id" UUID NOT NULL,
    "content_type_id" UUID NOT NULL,
    "category_id" UUID,
    "collection_id" UUID,
    "style_id" UUID,
    "body_placement_id" UUID,
    "slug" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_translations" (
    "id" UUID NOT NULL,
    "content_id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "short_description" TEXT,
    "description" TEXT,
    "story" TEXT,
    "inspiration" TEXT,
    "meaning" TEXT,
    "process" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_media" (
    "id" UUID NOT NULL,
    "content_id" UUID NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "role" "MediaRole" NOT NULL,
    "s3_key" TEXT NOT NULL,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_tags" (
    "content_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_tags_pkey" PRIMARY KEY ("content_id","tag_id")
);

-- CreateTable
CREATE TABLE "content_displays" (
    "id" UUID NOT NULL,
    "content_id" UUID NOT NULL,
    "surface" "DisplaySurface" NOT NULL,
    "display_type" "DisplayType" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_displays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_seo" (
    "id" UUID NOT NULL,
    "content_id" UUID NOT NULL,
    "og_image_key" TEXT,
    "canonical_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_seo_translations" (
    "id" UUID NOT NULL,
    "content_seo_id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "keywords" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_seo_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contents_slug_key" ON "contents"("slug");

-- CreateIndex
CREATE INDEX "contents_content_type_id_idx" ON "contents"("content_type_id");

-- CreateIndex
CREATE INDEX "contents_category_id_idx" ON "contents"("category_id");

-- CreateIndex
CREATE INDEX "contents_collection_id_idx" ON "contents"("collection_id");

-- CreateIndex
CREATE INDEX "contents_style_id_idx" ON "contents"("style_id");

-- CreateIndex
CREATE INDEX "contents_body_placement_id_idx" ON "contents"("body_placement_id");

-- CreateIndex
CREATE INDEX "contents_status_idx" ON "contents"("status");

-- CreateIndex
CREATE INDEX "contents_published_at_idx" ON "contents"("published_at");

-- CreateIndex
CREATE INDEX "content_translations_language_code_idx" ON "content_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "content_translations_content_id_language_code_key" ON "content_translations"("content_id", "language_code");

-- CreateIndex
CREATE INDEX "content_media_content_id_idx" ON "content_media"("content_id");

-- CreateIndex
CREATE INDEX "content_media_content_id_role_idx" ON "content_media"("content_id", "role");

-- CreateIndex
CREATE INDEX "content_media_content_id_sort_order_idx" ON "content_media"("content_id", "sort_order");

-- CreateIndex
CREATE INDEX "content_tags_tag_id_idx" ON "content_tags"("tag_id");

-- CreateIndex
CREATE INDEX "content_displays_surface_display_type_idx" ON "content_displays"("surface", "display_type");

-- CreateIndex
CREATE INDEX "content_displays_content_id_idx" ON "content_displays"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_displays_content_id_surface_display_type_key" ON "content_displays"("content_id", "surface", "display_type");

-- CreateIndex
CREATE UNIQUE INDEX "content_seo_content_id_key" ON "content_seo"("content_id");

-- CreateIndex
CREATE INDEX "content_seo_translations_language_code_idx" ON "content_seo_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "content_seo_translations_content_seo_id_language_code_key" ON "content_seo_translations"("content_seo_id", "language_code");

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_style_id_fkey" FOREIGN KEY ("style_id") REFERENCES "styles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_body_placement_id_fkey" FOREIGN KEY ("body_placement_id") REFERENCES "body_placements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_translations" ADD CONSTRAINT "content_translations_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_media" ADD CONSTRAINT "content_media_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_tags" ADD CONSTRAINT "content_tags_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_tags" ADD CONSTRAINT "content_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_displays" ADD CONSTRAINT "content_displays_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_seo" ADD CONSTRAINT "content_seo_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_seo_translations" ADD CONSTRAINT "content_seo_translations_content_seo_id_fkey" FOREIGN KEY ("content_seo_id") REFERENCES "content_seo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
