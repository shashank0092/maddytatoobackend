-- Enable RLS on styles
ALTER TABLE "styles" ENABLE ROW LEVEL SECURITY;

-- Allow public read access on styles
CREATE POLICY "Public profiles are viewable by everyone."
ON "styles" FOR SELECT
TO PUBLIC
USING (true);

-- Enable RLS on style_translations
ALTER TABLE "style_translations" ENABLE ROW LEVEL SECURITY;

-- Allow public read access on style_translations
CREATE POLICY "Public profiles are viewable by everyone."
ON "style_translations" FOR SELECT
TO PUBLIC
USING (true);
