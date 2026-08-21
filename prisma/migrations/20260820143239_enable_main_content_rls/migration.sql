-- Enable RLS on Main Content tables
ALTER TABLE "contents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_translations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_displays" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_seo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_seo_translations" ENABLE ROW LEVEL SECURITY;

-- Create policies for contents
CREATE POLICY "Enable read access for all users on contents" 
ON "contents" FOR SELECT USING (true);

-- Create policies for content_translations
CREATE POLICY "Enable read access for all users on content_translations" 
ON "content_translations" FOR SELECT USING (true);

-- Create policies for content_media
CREATE POLICY "Enable read access for all users on content_media" 
ON "content_media" FOR SELECT USING (true);

-- Create policies for content_tags
CREATE POLICY "Enable read access for all users on content_tags" 
ON "content_tags" FOR SELECT USING (true);

-- Create policies for content_displays
CREATE POLICY "Enable read access for all users on content_displays" 
ON "content_displays" FOR SELECT USING (true);

-- Create policies for content_seo
CREATE POLICY "Enable read access for all users on content_seo" 
ON "content_seo" FOR SELECT USING (true);

-- Create policies for content_seo_translations
CREATE POLICY "Enable read access for all users on content_seo_translations" 
ON "content_seo_translations" FOR SELECT USING (true);