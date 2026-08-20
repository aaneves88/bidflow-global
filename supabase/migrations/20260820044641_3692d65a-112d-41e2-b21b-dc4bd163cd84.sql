REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_profile_referral_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_referrals_updated_at() FROM PUBLIC;

REVOKE ALL ON FUNCTION public.generate_referral_code() FROM anon;
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM authenticated;
REVOKE ALL ON FUNCTION public.set_profile_referral_code() FROM anon;
REVOKE ALL ON FUNCTION public.set_profile_referral_code() FROM authenticated;
REVOKE ALL ON FUNCTION public.update_referrals_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.update_referrals_updated_at() FROM authenticated;
