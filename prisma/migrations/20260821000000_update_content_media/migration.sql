-- AlterTable
ALTER TABLE "content_media" DROP COLUMN "alt_text";

-- CreateTable
CREATE TABLE "content_media_translations" (
    "id" UUID NOT NULL,
    "media_id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "alt_text" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_media_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_media_translations_language_code_idx" ON "content_media_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "content_media_translations_media_id_language_code_key" ON "content_media_translations"("media_id", "language_code");

-- AddForeignKey
ALTER TABLE "content_media_translations" ADD CONSTRAINT "content_media_translations_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "content_media"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Enable Row Level Security
ALTER TABLE "content_media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_media_translations" ENABLE ROW LEVEL SECURITY;
