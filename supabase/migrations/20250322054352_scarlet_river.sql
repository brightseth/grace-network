/*
  # Setup storage for image uploads

  1. Storage
    - Create public bucket named 'images' for storing uploaded images
    - Skip creation if bucket already exists
  
  2. Security
    - Enable public access to the bucket
    - Add policies for:
      - Authenticated users can upload images
      - Anyone can view/download images
      - Users can delete their own images
*/

DO $$
BEGIN
  -- Only create bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('images', 'images', true);
  END IF;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Allow public access to images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid() = owner);