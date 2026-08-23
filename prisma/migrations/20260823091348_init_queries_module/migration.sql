-- CreateEnum
CREATE TYPE "QueryStatus" AS ENUM ('PENDING', 'CONTACTED', 'IN_PROGRESS', 'BOOKED', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "QueryPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "QuerySource" AS ENUM ('WEBSITE', 'INSTAGRAM', 'WHATSAPP', 'REFERRAL', 'GOOGLE', 'OTHER');

-- CreateEnum
CREATE TYPE "QueryMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "cover_media_key" TEXT;

-- CreateTable
CREATE TABLE "queries" (
    "id" UUID NOT NULL,
    "inquiry_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "tattoo_idea" TEXT NOT NULL,
    "budget_min" DECIMAL(12,2),
    "budget_max" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "preferred_date" DATE,
    "preferred_time" TEXT,
    "additional_notes" TEXT,
    "category_id" UUID,
    "style_id" UUID,
    "body_placement_id" UUID,
    "status" "QueryStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "QueryPriority" NOT NULL DEFAULT 'NORMAL',
    "source" "QuerySource" NOT NULL DEFAULT 'WEBSITE',
    "assigned_to" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "closed_at" TIMESTAMPTZ,

    CONSTRAINT "queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_media" (
    "id" UUID NOT NULL,
    "query_id" UUID NOT NULL,
    "media_type" "QueryMediaType" NOT NULL,
    "s3_key" TEXT NOT NULL,
    "mime_type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "query_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_history" (
    "id" UUID NOT NULL,
    "query_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "old_status" "QueryStatus",
    "new_status" "QueryStatus",
    "note" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "queries_inquiry_number_key" ON "queries"("inquiry_number");

-- CreateIndex
CREATE INDEX "queries_status_idx" ON "queries"("status");

-- CreateIndex
CREATE INDEX "queries_priority_idx" ON "queries"("priority");

-- CreateIndex
CREATE INDEX "queries_source_idx" ON "queries"("source");

-- CreateIndex
CREATE INDEX "queries_category_id_idx" ON "queries"("category_id");

-- CreateIndex
CREATE INDEX "queries_style_id_idx" ON "queries"("style_id");

-- CreateIndex
CREATE INDEX "queries_body_placement_id_idx" ON "queries"("body_placement_id");

-- CreateIndex
CREATE INDEX "queries_assigned_to_idx" ON "queries"("assigned_to");

-- CreateIndex
CREATE INDEX "queries_preferred_date_idx" ON "queries"("preferred_date");

-- CreateIndex
CREATE INDEX "queries_created_at_idx" ON "queries"("created_at");

-- CreateIndex
CREATE INDEX "query_media_query_id_idx" ON "query_media"("query_id");

-- CreateIndex
CREATE INDEX "query_media_media_type_idx" ON "query_media"("media_type");

-- CreateIndex
CREATE INDEX "query_media_is_active_idx" ON "query_media"("is_active");

-- CreateIndex
CREATE INDEX "query_media_sort_order_idx" ON "query_media"("sort_order");

-- CreateIndex
CREATE INDEX "query_history_query_id_idx" ON "query_history"("query_id");

-- CreateIndex
CREATE INDEX "query_history_created_by_idx" ON "query_history"("created_by");

-- CreateIndex
CREATE INDEX "query_history_created_at_idx" ON "query_history"("created_at");

-- CreateIndex
CREATE INDEX "query_history_new_status_idx" ON "query_history"("new_status");

-- AddForeignKey
ALTER TABLE "queries" ADD CONSTRAINT "queries_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queries" ADD CONSTRAINT "queries_style_id_fkey" FOREIGN KEY ("style_id") REFERENCES "styles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queries" ADD CONSTRAINT "queries_body_placement_id_fkey" FOREIGN KEY ("body_placement_id") REFERENCES "body_placements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queries" ADD CONSTRAINT "queries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_media" ADD CONSTRAINT "query_media_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_history" ADD CONSTRAINT "query_history_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_history" ADD CONSTRAINT "query_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
