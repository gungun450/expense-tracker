import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; //
import './Login.css';

function Login() { 
  const navigate = useNavigate(); // Add useNavigate hook
  const { login } = useAuth(); 
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const params = new URLSearchParams();
    params.append('email', formData.email);
    params.append('password', formData.password);

    try {
      // Convert formData object to URLSearchParams
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          //'Content-Type': 'application/json',
        },
        body:params,
        credentials: 'include' // Important for sessions
      });

      // 
      const data = await response.json();
     

      if (response.ok) {
        setMessage('Login successful!');
         login({ uid: data.uid}); // saves to AuthContext
       // login({ uid: data.uid, username: data.username });
        
        // Store user info if needed
        localStorage.setItem('user', JSON.stringify({ uid: data.uid }));
        localStorage.setItem('isAuthenticated', 'true');
        console.log('Login success:', data);
        // Redirect to category page after a brief delay
        setTimeout(() => {
          navigate('/category'); // or '/categories' or '/dashboard' based on your route
        }, 500);
        
      } else {
        setError(data.error || 'Login failed!');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back!</h2>
          <p>Login to manage your expenses</p>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;