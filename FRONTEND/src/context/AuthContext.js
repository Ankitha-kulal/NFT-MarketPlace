import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize auth state when component mounts
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check current session
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null);
          toast.success("Successfully signed in!");
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          toast.info("You have been signed out");
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user || null);
        }
      }
    );
    
    // Cleanup listener on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);
  
  // Check for an existing session
  const checkUserSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        // Session exists, set user
        setUser(data.session.user);
      } else {
        // No session, clear user
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking user session:", error);
      toast.error("Error checking authentication status");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Sign up with email and password
  const signUp = async (email, password, username) => {
    try {
      setLoading(true);
      
      // Check if username already exists
      const { data: existingUsers, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);
        
      if (usernameCheckError) {
        throw usernameCheckError;
      }
      
      if (existingUsers && existingUsers.length > 0) {
        toast.error('Username already taken. Please choose another.');
        return { error: { message: 'Username already taken' } };
      }
      
      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            auth_type: 'email',
          },
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });
      
      if (error) throw error;
      
      toast.success(
        "Registration successful! Please check your email to confirm your account.",
        { autoClose: 5000 }
      );
      
      return { data };
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(`Registration failed: ${error.message}`);
      return { error };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setUser(data.user);
      return { data };
    } catch (error) {
      console.error("Error signing in:", error);
      
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please confirm your email before logging in.');
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
      
      return { error };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast.error('MetaMask not detected. Please install it first.');
        window.open('https://metamask.io/download.html', '_blank');
        return { error: { message: 'MetaMask not installed' } };
      }
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const walletAddress = accounts[0];
      
      // Check if this wallet is already registered
      const { data: existingUsers, error: walletCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress);
        
      if (walletCheckError) {
        throw walletCheckError;
      }
      
      if (existingUsers && existingUsers.length > 0) {
        // Wallet already registered, try to sign in
        const walletEmail = `wallet_${walletAddress.toLowerCase().substring(2)}@nft.marketplace`;
        
        // Try to sign in this user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: walletEmail,
          password: existingUsers[0].encrypted_password || 'password_placeholder'
        });
        
        if (error) {
          // If we can't sign in, we may need to handle this differently
          console.error("Error signing in with existing wallet:", error);
          toast.error('Error authenticating with wallet. Please try again.');
          return { error };
        }
        
        setUser(data.user);
        toast.success('Successfully signed in with wallet!');
        return { data };
      }
      
      // Return the wallet address for new wallet registrations
      return { walletAddress };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      
      // User-friendly error messages
      if (error.message.includes('User rejected')) {
        toast.error('Connection rejected. Please approve the request in your wallet.');
      } else {
        toast.error(`Failed to connect wallet: ${error.message}`);
      }
      
      return { error };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      toast.success('Successfully signed out!');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(`Error signing out: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });
      
      if (error) throw error;
      
      toast.success('Password reset link sent to your email');
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(`Failed to send reset email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setLoading(true);
      
      // Update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (updateError) throw updateError;
      
      // Update user object
      if (user) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...updates
          }
        });
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Provide auth context value
  const value = {
    user,
    loading,
    isInitialized,
    signUp,
    signIn,
    signOut,
    connectWallet,
    resetPassword,
    updateUserProfile,
    checkUserSession
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;