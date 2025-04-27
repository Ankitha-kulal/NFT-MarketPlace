import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session) {
          setUser(session.user);
  
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_complete')
            .eq('id', session.user.id)
            .single();
  
          if (!profileError && profile && profile.is_complete) {
            setProfileComplete(true);
          } else {
            setProfileComplete(false);
          }
        } else {
          setUser(null);
          setProfileComplete(false);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        setUser(null);
        setProfileComplete(false);
      } finally {
        setLoading(false); // ONLY after everything is done
      }
    };
  
    checkSession();
  
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
  
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_complete')
          .eq('id', session.user.id)
          .single();
  
        if (!error && profile && profile.is_complete) {
          setProfileComplete(true);
        } else {
          setProfileComplete(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfileComplete(false);
      }
    });
  
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
 
  const handleLogout = async () => {
    try {
      setLoading(true);
      console.log('Attempting to sign out...'); // Debug log
      
      const { error } = await supabase.auth.signOut();
     
      if (error) {
        console.error('Supabase logout error:', error.message);
        return;
      }
     
      console.log('Sign out successful'); // Debug log
      setUser(null);
      setProfileComplete(false);
      
      // Use a short delay before redirect to ensure state is updated
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (err) {
      console.error('Unexpected error during logout:', err);
    } finally {
      setLoading(false);
    }
  };
 
  const value = {
    user,
    profileComplete,
    loading,
    handleLogout,
    isAuthenticated: !!user,
  };
 
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}