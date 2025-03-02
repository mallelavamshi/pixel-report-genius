
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { AuthContextType, AuthState } from '@/auth/types';
import { clearAuthState, fetchProfile, signIn, signOut, signUp } from '@/auth/authUtils';

const initialAuthState: AuthState = {
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAdmin: false
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prevState => ({ ...prevState, ...updates }));
  };

  useEffect(() => {
    const initializeAuth = async () => {
      updateAuthState({ loading: true });
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          updateAuthState({ session, user: session.user });
          
          if (session.user) {
            const { profile, isAdmin } = await fetchProfile(session.user.id);
            updateAuthState({ profile, isAdmin });
          }
        } else {
          updateAuthState({ 
            session: null, 
            user: null, 
            profile: null, 
            isAdmin: false 
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthState();
        updateAuthState(initialAuthState);
      } finally {
        updateAuthState({ loading: false });
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session) {
          updateAuthState({ session, user: session.user, loading: true });
          
          if (session.user) {
            const { profile, isAdmin } = await fetchProfile(session.user.id);
            updateAuthState({ profile, isAdmin });
          }
        } else {
          updateAuthState({ 
            session: null, 
            user: null, 
            profile: null, 
            isAdmin: false 
          });
        }
        
        updateAuthState({ loading: false });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    signUp,
    signIn, 
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
