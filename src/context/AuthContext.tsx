import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null; message?: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createDemoSession = (email: string, fullName: string) => {
  const demoUser = {
    id: `demo-user-${Date.now()}`,
    email,
    app_metadata: { provider: 'demo' },
    user_metadata: { full_name: fullName },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;

  const demoSession = {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: demoUser,
  } as Session;

  return { demoUser, demoSession };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    if (!isSupabaseConfigured) {
      setProfile({
        id: uid,
        full_name: 'Demo Farmer',
        location: 'Demo Farm',
        farm_info: 'Demo mode',
        temp_unit: 'C',
        notifications_enabled: true,
      });
      return;
    }

    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      setProfile(data as Profile | null);
    } catch {
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const initializeSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch {
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      const displayName = fullName.trim() || 'Demo Farmer';
      const { demoUser, demoSession } = createDemoSession(email, displayName);
      setSession(demoSession);
      setUser(demoUser);
      setProfile({
        id: demoUser.id,
        full_name: displayName,
        location: 'Demo Farm',
        farm_info: 'Demo mode',
        temp_unit: 'C',
        notifications_enabled: true,
      });
      setLoading(false);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
        });
      }
      return { error: null };
    } catch {
      return { error: 'Unable to create your account right now. Please try again.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const trimmedName = email.split('@')[0]?.replace(/[._-]/g, ' ') || 'Demo Farmer';
      const { demoUser, demoSession } = createDemoSession(email, trimmedName);
      setSession(demoSession);
      setUser(demoUser);
      setProfile({
        id: demoUser.id,
        full_name: trimmedName,
        location: 'Demo Farm',
        farm_info: 'Demo mode',
        temp_unit: 'C',
        notifications_enabled: true,
      });
      setLoading(false);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: 'Unable to sign in right now. Please try again.' };
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: null,
        message: 'Demo mode: password reset is not required. Use the login form to continue.',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) return { error: error.message };
      return {
        error: null,
        message: 'Password reset instructions have been sent to your email.',
      };
    } catch {
      return { error: 'Unable to send reset instructions right now. Please try again.' };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setUser(null);
      setProfile(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } finally {
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, resetPassword, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
