import { supabase } from '@/integrations/supabase/client';

export const PRODUCT_IMAGES_BUCKET = 'product-images';
export const MAX_PRODUCT_IMAGES = 3;
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** image_urls stores storage paths; the bucket is private, so we sign them for display. */
export async function signProductImages(paths: string[], expiresIn = 60 * 60 * 24 * 7): Promise<string[]> {
  const clean = paths.filter(Boolean);
  if (!clean.length) return [];
  const { data } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).createSignedUrls(clean, expiresIn);
  return (data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[];
}

export async function uploadProductImage(userId: string, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function removeProductImage(path: string) {
  await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
}
