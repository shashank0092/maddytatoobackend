-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FeedbackMediaType" AS ENUM ('VIDEO', 'IMAGE');



-- CreateTable
CREATE TABLE "feedback" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "rating" INTEGER NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "consent_to_publish" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_translations" (
    "id" UUID NOT NULL,
    "feedback_id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "feedback_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_media" (
    "id" UUID NOT NULL,
    "feedback_id" UUID NOT NULL,
    "media_type" "FeedbackMediaType" NOT NULL,
    "s3_key" TEXT NOT NULL,
    "mime_type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "feedback_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedback_status_idx" ON "feedback"("status");

-- CreateIndex
CREATE INDEX "feedback_is_featured_idx" ON "feedback"("is_featured");

-- CreateIndex
CREATE INDEX "feedback_is_verified_idx" ON "feedback"("is_verified");

-- CreateIndex
CREATE INDEX "feedback_published_at_idx" ON "feedback"("published_at");

-- CreateIndex
CREATE INDEX "feedback_submitted_at_idx" ON "feedback"("submitted_at");

-- CreateIndex
CREATE INDEX "feedback_translations_language_code_idx" ON "feedback_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_translations_feedback_id_language_code_key" ON "feedback_translations"("feedback_id", "language_code");

-- CreateIndex
CREATE INDEX "feedback_media_feedback_id_idx" ON "feedback_media"("feedback_id");

-- CreateIndex
CREATE INDEX "feedback_media_media_type_idx" ON "feedback_media"("media_type");

-- CreateIndex
CREATE INDEX "feedback_media_is_active_idx" ON "feedback_media"("is_active");

-- CreateIndex
CREATE INDEX "feedback_media_sort_order_idx" ON "feedback_media"("sort_order");

-- AddForeignKey
ALTER TABLE "feedback_translations" ADD CONSTRAINT "feedback_translations_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_media" ADD CONSTRAINT "feedback_media_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

