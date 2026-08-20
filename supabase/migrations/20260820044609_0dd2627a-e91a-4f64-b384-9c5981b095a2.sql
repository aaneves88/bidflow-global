REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.set_profile_referral_code() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_profile_referral_code() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.update_referrals_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_referrals_updated_at() FROM authenticated;
