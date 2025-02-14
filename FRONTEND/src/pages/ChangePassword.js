import React from 'react';

const ChangePassword = () => {
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div className="card z-depth-3" style={{ padding: '30px', maxWidth: '400px', width: '100%', borderRadius: '10px', backgroundColor: '#f7f7f7' }}>
        <h4 className="center-align" style={{ color: '#2c3e50' }}>Change Password</h4>
        <p className="center-align" style={{ color: '#34495e' }}>Update your password securely.</p>
        
        <form>
          {/* Email Field */}
          <div className="input-field">
            <i className="material-icons prefix blue-text">email</i>
            <input type="email" id="email" className="validate" required />
            <label htmlFor="email">Email Address</label>
          </div>

          {/* New Password Field */}
          <div className="input-field">
            <i className="material-icons prefix blue-text">lock</i>
            <input type="password" id="new-password" className="validate" required />
            <label htmlFor="new-password">New Password</label>
          </div>

          {/* Confirm Password Field */}
          <div className="input-field">
            <i className="material-icons prefix blue-text">lock</i>
            <input type="password" id="confirm-password" className="validate" required />
            <label htmlFor="confirm-password">Confirm Password</label>
          </div>

          {/* Submit Button */}
          <div className="center-align">
            <button className="btn waves-effect waves-light blue darken-3" type="submit">
              Change Password
              <i className="material-icons right">send</i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
