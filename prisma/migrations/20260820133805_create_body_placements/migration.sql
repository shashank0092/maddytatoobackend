-- CreateTable
CREATE TABLE "body_placements" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "cover_image_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "body_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "body_placement_translations" (
    "id" UUID NOT NULL,
    "body_placement_id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "alt_text" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "body_placement_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "body_placements_slug_key" ON "body_placements"("slug");

-- CreateIndex
CREATE INDEX "body_placement_translations_language_code_idx" ON "body_placement_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "body_placement_translations_body_placement_id_language_code_key" ON "body_placement_translations"("body_placement_id", "language_code");

-- AddForeignKey
ALTER TABLE "body_placement_translations" ADD CONSTRAINT "body_placement_translations_body_placement_id_fkey" FOREIGN KEY ("body_placement_id") REFERENCES "body_placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
