import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [message, setMessage] = useState('Processing authentication...');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const { checkUserSession } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parse the URL hash if present (used by Supabase auth)
        const hash = window.location.hash;
        if (hash) {
          // Get the URL parameters
          const params = new URLSearchParams(hash.replace('#', ''));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');
          
          console.log("Auth callback type:", type);
          
          // Check if this is an email confirmation
          if (type === 'email_confirmation' || type === 'signup' || type === 'recovery') {
            if (accessToken) {
              // Set the session with the tokens
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              
              if (sessionError) {
                throw sessionError;
              }
              
              // Update user session in context
              await checkUserSession();
              
              // Show success message based on type
              if (type === 'recovery') {
                setMessage('Password reset successful!');
                toast.success('Password has been reset successfully!');
                setTimeout(() => navigate('/profile'), 2000);
              } else {
                setMessage('Email verified successfully!');
                toast.success('Your email has been verified! Redirecting to dashboard...');
                setTimeout(() => navigate('/'), 2000);
              }
            } else {
              throw new Error('No access token found in URL');
            }
          } else {
            throw new Error('Unknown authentication type');
          }
        } else {
          // Check if there are query parameters (older Supabase auth method)
          const query = window.location.search;
          const params = new URLSearchParams(query);
          const error = params.get('error');
          const errorDescription = params.get('error_description');
          
          if (error) {
            throw new Error(errorDescription || 'Authentication error');
          }
          
          // If no hash or useful query parameters, just refresh user session
          await checkUserSession();
          setMessage('Processing authentication...');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setIsError(true);
        setMessage(`Authentication error: ${error.message}`);
        toast.error(`Authentication error: ${error.message}`);
        
        // Redirect to login after error
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    
    handleAuthCallback();
  }, [navigate, checkUserSession]);

  return (
    <div className="container" style={{ marginTop: '100px', textAlign: 'center' }}>
      <div className="card" style={{ padding: '40px', borderRadius: '10px' }}>
        <div className="progress" style={{ display: isError ? 'none' : 'block' }}>
          <div className="indeterminate"></div>
        </div>
        
        <h4 style={{ color: isError ? '#f44336' : '#26a69a', marginTop: '20px' }}>
          {message}
        </h4>
        
        {isError && (
          <button 
            className="btn waves-effect waves-light" 
            style={{ marginTop: '20px' }}
            onClick={() => navigate('/login')}
          >
            Go to Login
            <i className="material-icons right">login</i>
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;