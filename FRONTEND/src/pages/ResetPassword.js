import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Make sure this path is correct
import M from 'materialize-css'; // Using Materialize like in your CompleteProfile component

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      M.toast({ html: 'Please enter your email address', classes: 'red' });
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      // Use Supabase's password reset functionality
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, // Adjust this URL as needed
      });
      
      if (error) {
        throw error;
      }
      
      setMessage(`Password reset link has been sent to ${email}`);
      M.toast({ html: 'Password reset email sent successfully!', classes: 'green' });
    } catch (error) {
      console.error('Error sending reset email:', error);
      M.toast({ html: error.message || 'Error sending reset link', classes: 'red' });
      setMessage(''); // Clear success message if there was an error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div className="card z-depth-3" style={{ padding: '30px', maxWidth: '400px', width: '100%', borderRadius: '10px', backgroundColor: '#f7f7f7' }}>
        <h4 className="center-align" style={{ color: '#2c3e50' }}>Reset Password</h4>
        <p className="center-align" style={{ color: '#34495e' }}>Enter your email address to receive a password reset link.</p>
        
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="input-field">
            <i className="material-icons prefix blue-text">email</i>
            <input
              type="email"
              id="email"
              className="validate"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <label htmlFor="email" className={email ? "active" : ""}>Email Address</label>
          </div>

          {/* Submit Button */}
          <div className="center-align">
            <button 
              className="btn waves-effect waves-light blue darken-3" 
              type="submit"
              disabled={loading}
              style={{ borderRadius: '20px', padding: '0 25px' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
              <i className="material-icons right">{loading ? 'hourglass_empty' : 'send'}</i>
            </button>
          </div>
        </form>

        {/* Message after submission */}
        {message && (
          <div className="card-panel green lighten-4 green-text text-darken-4" style={{ marginTop: '20px' }}>
            <i className="material-icons left">check_circle</i>
            {message}
          </div>
        )}
        
        {/* Back to Login Link */}
        <div className="center-align" style={{ marginTop: '20px' }}>
          <a href="/login" className="blue-text text-darken-3">
            <i className="material-icons tiny">arrow_back</i> Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;