CREATE OR REPLACE FUNCTION public.get_my_referrals()
RETURNS TABLE (
  id uuid,
  referral_code text,
  status text,
  discount_percent integer,
  created_at timestamptz,
  converted_at timestamptz,
  paid_at timestamptz,
  referred_full_name text,
  referred_email text,
  referred_created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.referral_code, r.status, r.discount_percent, r.created_at,
         r.converted_at, r.paid_at,
         p.full_name, p.email, p.created_at
  FROM public.referrals r
  LEFT JOIN public.profiles p ON p.id = r.referred_user_id
  WHERE r.referrer_user_id = auth.uid()
  ORDER BY r.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.get_my_referrals() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_referrals() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_referrals()
RETURNS TABLE (
  id uuid,
  referral_code text,
  status text,
  discount_percent integer,
  created_at timestamptz,
  converted_at timestamptz,
  paid_at timestamptz,
  referrer_full_name text,
  referrer_email text,
  referred_full_name text,
  referred_email text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT r.id, r.referral_code, r.status, r.discount_percent, r.created_at,
         r.converted_at, r.paid_at,
         rp.full_name, rp.email,
         dp.full_name, dp.email
  FROM public.referrals r
  LEFT JOIN public.profiles rp ON rp.id = r.referrer_user_id
  LEFT JOIN public.profiles dp ON dp.id = r.referred_user_id
  ORDER BY r.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_referrals() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_referrals() TO authenticated;