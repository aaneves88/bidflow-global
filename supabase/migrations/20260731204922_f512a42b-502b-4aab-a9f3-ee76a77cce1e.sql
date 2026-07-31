CREATE OR REPLACE FUNCTION public.get_public_proposal(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  IF p_code IS NULL OR length(p_code) < 4 THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'id', p.id,
    'title', p.title,
    'description', p.description,
    'notes', p.notes,
    'terms', p.terms,
    'currency', p.currency,
    'total_amount', p.total_amount,
    'discount_amount', p.discount_amount,
    'discount_type', p.discount_type,
    'valid_until', p.valid_until,
    'public_code', p.public_code,
    'status_id', p.status_id,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'clients', CASE WHEN c.id IS NULL THEN NULL ELSE jsonb_build_object(
      'name', c.name,
      'company', c.company,
      'email', c.email,
      'phone', c.phone
    ) END,
    'proposal_statuses', CASE WHEN s.id IS NULL THEN NULL ELSE jsonb_build_object(
      'name', s.name,
      'color', s.color,
      'is_final', s.is_final
    ) END,
    'proposal_items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', i.id,
        'description', i.description,
        'quantity', i.quantity,
        'unit_price', i.unit_price,
        'total', i.total,
        'position', i.position
      ) ORDER BY i.position)
      FROM public.proposal_items i
      WHERE i.proposal_id = p.id
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM public.proposals p
  LEFT JOIN public.clients c ON c.id = p.client_id
  LEFT JOIN public.proposal_statuses s ON s.id = p.status_id
  WHERE p.public_code = p_code;

  RETURN v_result;
END;
$function$;