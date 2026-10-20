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

type RawProduct = { id: string; name: string; description: string | null; image_urls: string[] | null };

/** Products for the PDF annex, in item order, with signed image URLs. */
export async function buildPdfProducts(products: RawProduct[]) {
  return Promise.all(products.map(async (p) => ({
    name: p.name,
    description: p.description,
    imageUrls: await signProductImages(p.image_urls ?? []),
  })));
}

/** Loads the linked products of a proposal's items (owner side). */
export async function loadItemProducts(items: { product_id?: string | null }[]): Promise<RawProduct[]> {
  const ids = [...new Set(items.map((i) => i.product_id).filter(Boolean))] as string[];
  if (!ids.length) return [];
  const { data } = await supabase.from('products').select('id, name, description, image_urls').in('id', ids);
  const byId = new Map((data ?? []).map((p: any) => [p.id, p as RawProduct]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as RawProduct[];
}
