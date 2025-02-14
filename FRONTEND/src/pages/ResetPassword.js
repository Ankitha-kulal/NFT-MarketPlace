import React, { useState } from 'react';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally, here you would handle the password reset logic (e.g., API call).
    setMessage(`Password reset link has been sent to ${email}`);
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
            />
            <label htmlFor="email">Email Address</label>
          </div>

          {/* Submit Button */}
          <div className="center-align">
            <button className="btn waves-effect waves-light blue darken-3" type="submit">
              Send Reset Link
              <i className="material-icons right">send</i>
            </button>
          </div>
        </form>

        {/* Message after submission */}
        {message && <p className="center-align" style={{ color: '#27ae60', marginTop: '20px' }}>{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
