-- Enable Row Level Security (RLS)
ALTER TABLE "body_placements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "body_placement_translations" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to read body placements (Public Read Access)
CREATE POLICY "Allow public read access on body_placements"
ON "body_placements"
FOR SELECT
TO public
USING (true);

-- Policy: Allow everyone to read body placement translations (Public Read Access)
CREATE POLICY "Allow public read access on body_placement_translations"
ON "body_placement_translations"
FOR SELECT
TO public
USING (true);