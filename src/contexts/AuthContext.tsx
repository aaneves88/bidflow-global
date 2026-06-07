import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  onboardingComplete: boolean;
  refreshOnboarding: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  onboardingComplete: false,
  refreshOnboarding: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(true);

  const refreshOnboarding = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      setOnboardingComplete(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', currentUser.id)
      .single();

    setOnboardingComplete(!!data?.onboarding_complete);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setLoading(true);
          // Defer Supabase calls to avoid deadlock inside the auth callback
          setTimeout(() => {
            Promise.all([
              supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .eq('role', 'admin')
                .maybeSingle(),
              supabase
                .from('profiles')
                .select('onboarding_complete')
                .eq('id', session.user.id)
                .single(),
            ]).then(([{ data: role }, { data: profile }]) => {
              setIsAdmin(!!role);
              setOnboardingComplete(!!profile?.onboarding_complete);
              setLoading(false);
            });
          }, 0);
        } else {
          setIsAdmin(false);
          setOnboardingComplete(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const [{ data: role }, { data: profile }] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', session.user.id)
            .single(),
        ]);

        setIsAdmin(!!role);
        setOnboardingComplete(!!profile?.onboarding_complete);
      } else {
        setIsAdmin(false);
        setOnboardingComplete(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, onboardingComplete, refreshOnboarding, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
