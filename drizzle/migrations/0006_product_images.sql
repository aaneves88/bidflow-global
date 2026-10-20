ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.proposal_items ADD COLUMN IF NOT EXISTS product_id uuid NULL REFERENCES public.products(id) ON DELETE SET NULL;

CREATE POLICY "product images owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "product images owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "product images owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.get_public_proposal(p_code text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_result jsonb;
BEGIN
  IF p_code IS NULL OR length(p_code) < 4 THEN RETURN NULL; END IF;
  SELECT jsonb_build_object(
    'id', p.id, 'title', p.title, 'description', p.description, 'notes', p.notes, 'terms', p.terms,
    'currency', p.currency, 'total_amount', p.total_amount, 'discount_amount', p.discount_amount,
    'discount_type', p.discount_type, 'valid_until', p.valid_until, 'public_code', p.public_code,
    'status_id', p.status_id, 'show_cover', p.show_cover, 'show_why_me', p.show_why_me,
    'created_at', p.created_at, 'updated_at', p.updated_at,
    'clients', CASE WHEN c.id IS NULL THEN NULL ELSE jsonb_build_object('name', c.name, 'company', c.company, 'email', c.email, 'phone', c.phone) END,
    'proposal_statuses', CASE WHEN s.id IS NULL THEN NULL ELSE jsonb_build_object('name', s.name, 'color', s.color, 'is_final', s.is_final) END,
    'proposal_items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', i.id, 'description', i.description, 'quantity', i.quantity,
        'unit_price', i.unit_price, 'total', i.total, 'position', i.position, 'product_id', i.product_id) ORDER BY i.position)
      FROM public.proposal_items i WHERE i.proposal_id = p.id), '[]'::jsonb),
    'products', COALESCE((
      SELECT jsonb_agg(x.obj ORDER BY x.pos) FROM (
        SELECT DISTINCT ON (pr.id) min(i.position) OVER (PARTITION BY pr.id) AS pos,
          jsonb_build_object('id', pr.id, 'name', pr.name, 'description', pr.description, 'image_urls', pr.image_urls) AS obj
        FROM public.proposal_items i JOIN public.products pr ON pr.id = i.product_id AND pr.user_id = p.user_id
        WHERE i.proposal_id = p.id
      ) x), '[]'::jsonb)
  ) INTO v_result
  FROM public.proposals p
  LEFT JOIN public.clients c ON c.id = p.client_id
  LEFT JOIN public.proposal_statuses s ON s.id = p.status_id
  WHERE p.public_code = p_code;
  RETURN v_result;
END;
$function$;