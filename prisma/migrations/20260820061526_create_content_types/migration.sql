-- CreateTable
CREATE TABLE "content_types" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "cover_image_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_type_translations" (
    "id" UUID NOT NULL,
    "content_type_id" UUID NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "alt_text" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "content_type_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_types_slug_key" ON "content_types"("slug");

-- CreateIndex
CREATE INDEX "content_type_translations_language_code_idx" ON "content_type_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "content_type_translations_content_type_id_language_code_key" ON "content_type_translations"("content_type_id", "language_code");

-- AddForeignKey
ALTER TABLE "content_type_translations" ADD CONSTRAINT "content_type_translations_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE "content_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_type_translations" ENABLE ROW LEVEL SECURITY;
