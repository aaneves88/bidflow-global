DROP FUNCTION IF EXISTS public.get_admin_referrals();

CREATE OR REPLACE FUNCTION public.get_admin_referrals()
 RETURNS TABLE(id uuid, referral_code text, status text, discount_percent integer, created_at timestamp with time zone, converted_at timestamp with time zone, paid_at timestamp with time zone, reward_granted_at timestamp with time zone, referrer_user_id uuid, referrer_full_name text, referrer_email text, referred_full_name text, referred_email text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT r.id, r.referral_code, r.status, r.discount_percent, r.created_at,
         r.converted_at, r.paid_at, r.reward_granted_at,
         r.referrer_user_id,
         rp.full_name, rp.email,
         dp.full_name, dp.email
  FROM public.referrals r
  LEFT JOIN public.profiles rp ON rp.id = r.referrer_user_id
  LEFT JOIN public.profiles dp ON dp.id = r.referred_user_id
  ORDER BY r.created_at DESC;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_admin_referrals() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_referrals() TO authenticated;