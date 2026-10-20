CREATE POLICY "product images read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');
COMMENT ON COLUMN public.products.image_urls IS 'Storage paths in the private product-images bucket (served via signed URLs).';