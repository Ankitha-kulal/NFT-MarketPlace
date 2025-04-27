import React, { useEffect, useState } from 'react';
import M from 'materialize-css';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    M.AutoInit();
    
    // Check if user came from email verification
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if profile is complete by querying your profiles table
        const { data: profile, error } = await supabase
          .from('profiles') // Make sure you have a profiles table
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // 🔐 LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        M.toast({ html: error.message, classes: 'red' });
      } else {
        M.toast({ html: 'Login successful!', classes: 'green' });
        
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
          setTimeout(() => navigate('/complete-profile'), 1000);
        } else {
          setTimeout(() => navigate('/explore'), 1000);
        }
      }
    } else {
      // 🆕 SIGNUP
      if (password !== confirmPassword) {
        M.toast({ html: 'Passwords do not match!', classes: 'red' });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirect to profile completion page after email verification
          emailRedirectTo: 'http://localhost:3000/complete-profile',
          data: {
            username: username,
          },
        },
      });

      if (error) {
        M.toast({ html:'Issue In LOGIN'+ error.message, classes: 'red' });
      } else {
        M.toast({ html: 'Signup successful! Please check your email.', classes: 'green' });
        setIsLogin(true);
      }
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', color: '#2c3e50' }}>
      <div className="card z-depth-3" style={{ padding: '30px', maxWidth: '400px', width: '100%', borderRadius: '10px' }}>
        <h4 className="center-align" style={{ color: '#2c3e50' }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </h4>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-field">
                <i className="material-icons prefix blue-text">person</i>
                <input
                  type="text"
                  id="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label htmlFor="username">Username</label>
              </div>
            </>
          )}

          <div className="input-field">
            <i className="material-icons prefix blue-text">email</i>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="input-field">
            <i className="material-icons prefix blue-text">lock</i>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password">Password</label>
          </div>

          {!isLogin && (
            <div className="input-field">
              <i className="material-icons prefix blue-text">lock_outline</i>
              <input
                type="password"
                id="confirm-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <label htmlFor="confirm-password">Confirm Password</label>
            </div>
          )}

          <div className="center-align">
            <button className="btn waves-effect waves-light blue darken-3" type="submit">
              {isLogin ? 'Login' : 'Sign Up'}
              <i className="material-icons right">send</i>
            </button>
          </div>
        </form>

        <div className="center-align" style={{ marginTop: '20px' }}>
          <a
            href="#!"
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: '#2c3e50', textDecoration: 'none', fontWeight: 'bold' }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;