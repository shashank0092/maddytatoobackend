-- CreateTable
CREATE TABLE "styles" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "cover_image_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "style_translations" (
    "id" UUID NOT NULL,
    "style_id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "alt_text" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "style_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "styles_slug_key" ON "styles"("slug");

-- CreateIndex
CREATE INDEX "style_translations_language_code_idx" ON "style_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "style_translations_style_id_language_code_key" ON "style_translations"("style_id", "language_code");

-- AddForeignKey
ALTER TABLE "style_translations" ADD CONSTRAINT "style_translations_style_id_fkey" FOREIGN KEY ("style_id") REFERENCES "styles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
