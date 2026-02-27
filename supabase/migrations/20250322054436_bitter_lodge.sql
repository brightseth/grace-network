/*
  # Allow anonymous uploads

  1. Security Updates
    - Enable anonymous uploads to the images bucket
    - Maintain public read access
    - Remove authenticated-only restrictions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Allow public access to images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow anonymous uploads
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'images');

-- Allow deletion only through admin functions
CREATE POLICY "Only admins can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.role() = 'service_role');