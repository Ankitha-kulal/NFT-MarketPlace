import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import M from 'materialize-css';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from state if available
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }

    // Check for auth verification in URL
    const checkVerification = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const type = params.get('type');

        // If token exists in URL, attempt to handle verification
        if (token && type === 'email_confirmation') {
          setLoading(true);
          
          // Supabase will handle this automatically, but we can check the session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error verifying email:', error);
            M.toast({ html: `Verification failed: ${error.message}`, classes: 'red' });
          } else if (data?.session) {
            setVerified(true);
            M.toast({ html: 'Email verified successfully!', classes: 'green' });
            
            // Wait a moment then redirect to complete profile
            setTimeout(() => {
              navigate('/complete-profile');
            }, 2000);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setLoading(false);
      }
    };

    checkVerification();
  }, [location, navigate]);

  const resendVerificationEmail = async () => {
    if (!email) {
      M.toast({ html: 'Please enter your email address', classes: 'red' });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) {
        M.toast({ html: `Error: ${error.message}`, classes: 'red' });
      } else {
        M.toast({ html: 'Verification email sent!', classes: 'green' });
      }
    } catch (error) {
      console.error('Error resending email:', error);
      M.toast({ html: 'Failed to resend verification email', classes: 'red' });
    } finally {
      setLoading(false);
    }
  };

  // If verification was successful
  if (verified) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <div className="card-panel" style={{ padding: '30px', borderRadius: '10px' }}>
          <i className="material-icons" style={{ fontSize: '64px', color: '#4CAF50' }}>check_circle</i>
          <h4>Email Verified!</h4>
          <p>Your email has been successfully verified.</p>
          <p>You'll be redirected to complete your profile...</p>
          <div className="progress">
            <div className="indeterminate"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div className="card z-depth-3" style={{ padding: '30px', maxWidth: '500px', width: '100%', borderRadius: '10px' }}>
        <div className="center-align">
          <i className="material-icons" style={{ fontSize: '64px', color: '#2196F3' }}>email</i>
          <h4 style={{ color: '#2c3e50' }}>Verify Your Email</h4>
          <p>We've sent a verification email to your inbox. Please check your email and click on the verification link.</p>
          
          <div className="divider" style={{ margin: '20px 0' }}></div>
          
          <h5>Didn't receive the email?</h5>
          <p>Check your spam folder or request a new verification email.</p>
          
          <div className="input-field">
            <i className="material-icons prefix">email</i>
            <input
              type="email"
              id="resend-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <label htmlFor="resend-email" className={email ? 'active' : ''}>Email Address</label>
          </div>
          
          <button
            onClick={resendVerificationEmail}
            className="btn waves-effect waves-light blue"
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
            <i className="material-icons right">send</i>
          </button>
          
          <div style={{ marginTop: '20px' }}>
            <Link to="/login" className="btn-flat waves-effect">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;