import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if profile is complete by querying your profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_complete')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error checking profile:', error);
          return;
        }
        
        // If profile is not complete, redirect to profile completion
        if (!profile || !profile.is_complete) {
          navigate('/complete-profile');
        } else {
          navigate('/explore');
        }
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Login only
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }
      
      // Check if profile is complete before redirecting
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_complete')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error checking profile:', profileError);
        setTimeout(() => navigate('/explore'), 1000);
        return;
      }
      
      // Redirect based on profile completion status
      if (!profile || !profile.is_complete) {
        navigate('/complete-profile');
      } else {
        navigate('/explore');
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Using Supabase's built-in password reset functionality
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setResetSent(true);
    } catch (error) {
      console.error(error);
      alert(error.message || "An error occurred sending the password reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-green-500/20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {forgotPassword ? "Reset Password" : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {forgotPassword ? "Enter your email to receive a reset link" : "Welcome back"}
          </p>
        </div>

        {forgotPassword ? (
          resetSent ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-900/50 rounded-lg">
                <p className="text-green-400">
                  Reset link sent! Check your email inbox.
                </p>
              </div>
              <button
                onClick={() => {
                  setForgotPassword(false);
                  setResetSent(false);
                }}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
              <div className="rounded-md -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setForgotPassword(false)}
                  className="text-sm font-medium text-green-400 hover:text-green-300"
                >
                  Back to login
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          )
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md -space-y-px">
              <div className="mb-4">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={() => setForgotPassword(true)}
                className="text-sm font-medium text-green-400 hover:text-green-300"
              >
                Forgot your password?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-green-400 hover:text-green-300">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;