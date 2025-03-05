
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from './types';

export const clearAuthState = () => {
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.expires_at');
  localStorage.removeItem('supabase.auth.refresh_token');
  
  sessionStorage.clear();
};

export const fetchProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Ensure we have subscription tier and image credits in the profile
    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role || 'user',
      subscription_tier: data.subscription_tier || 'basic',
      image_credits: data.image_credits || 200,
      credits_used: data.credits_used || 0
    };
    
    return {
      profile,
      isAdmin: profile.role === 'admin'
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      profile: null,
      isAdmin: false
    };
  }
};

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Create profile with default 'basic' subscription and 200 image credits
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: 'user',
          subscription_tier: 'basic',
          image_credits: 200,
          credits_used: 0
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        toast.error('Error creating user profile. Please try again.');
        throw profileError;
      }
    }

    toast.success('Signup successful. Please check your email for verification.');
  } catch (error: any) {
    toast.error(error.message || 'An error occurred during signup');
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    toast.success('Logged in successfully');
  } catch (error: any) {
    toast.error(error.message || 'Login failed');
    throw error;
  }
};

export const signOut = async () => {
  try {
    await supabase.auth.signOut();
    
    clearAuthState();
    
    toast.success('Logged out successfully');
    
    // Force reload to clear any cached state
    window.location.href = '/';
  } catch (error: any) {
    console.error('Error signing out:', error);
    toast.error(error.message || 'Error signing out');
    throw error;
  }
};
