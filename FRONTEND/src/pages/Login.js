import React, { useEffect } from 'react';
import M from 'materialize-css';

const Login = () => {
  useEffect(() => {
    M.AutoInit(); // Initialize Materialize components
  }, []);

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div className="card z-depth-3" style={{ padding: '30px', maxWidth: '400px', width: '100%', borderRadius: '10px' }}>
        <h4 className="center-align" style={{ color: '#2c3e50' }}>Login</h4>
        <form>
          <div className="input-field">
            <i className="material-icons prefix blue-text">email</i>
            <input type="email" id="email" className="validate" required />
            <label htmlFor="email">Email</label>
          </div>

          <div className="input-field">
            <i className="material-icons prefix blue-text">lock</i>
            <input type="password" id="password" className="validate" required />
            <label htmlFor="password">Password</label>
          </div>

          <div className="center-align">
            <button className="btn waves-effect waves-light blue darken-3" type="submit">
              Login
              <i className="material-icons right">send</i>
            </button>
          </div>
        </form>

        <div className="center-align" style={{ marginTop: '20px' }}>
          <a href="#!" style={{ color: '#2c3e50', textDecoration: 'none', fontWeight: 'bold' }}>Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
