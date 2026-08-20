-- Enable RLS for tags
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tag_translations" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to tags
CREATE POLICY "Allow public read access to tags"
  ON "tags"
  FOR SELECT
  USING (true);

-- Policy: Allow public read access to tag translations
CREATE POLICY "Allow public read access to tag_translations"
  ON "tag_translations"
  FOR SELECT
  USING (true);