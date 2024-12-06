import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../static/login.css';
import logo from '../static/images/raysoniclogo.png';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (username && token) {
      // Optionally verify token with backend if not in simulation mode
      // Example:
      /*
      axios.get('/api/verify-token', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          if (response.data.status === 'valid') {
            onLogin(username);
            navigate('/homepage');
          }
        })
        .catch(() => {
          localStorage.removeItem('username');
          localStorage.removeItem('token');
        });
      */
      
      // Simulate valid token check
      onLogin(username);
      navigate('/homepage');
    }
  }, [navigate, onLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Commented out login verification code for testing
      /*
      const response = await axios.post('/api/login', { email, password });
      if (response.data.status === 'success') {
        const { username, token } = response.data;
        localStorage.setItem('username', username); // Save username
        localStorage.setItem('token', token); // Save token
        setErrorMessage('');
        onLogin(username);
        navigate('/homepage');
      } else {
        setErrorMessage(response.data.message);
      }
      */
      // Simulate successful login for testing
      const simulatedUsername = 'Yash Mahamulkar'; // Use a simulated username
      const simulatedToken = 'dummyToken'; // Simulate a token
      localStorage.setItem('username', simulatedUsername);
      localStorage.setItem('token', simulatedToken);
      setErrorMessage('');
      onLogin(simulatedUsername);
      navigate('/homepage');
    } catch (error) {
      setErrorMessage('An error occurred.');
    }
  };

  return (
    <div className="outer">
      <div className="card">
        <div className="image_container">
          <img src={logo} alt="Login" className="login_image" />
        </div>

        <div className="login_register">
          <a href="/login" className="login">Login</a>
          <a href="/signup" className="register">Signup</a>
        </div>

        <form className="form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            className="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="pass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login_btn">Login</button>
        </form>

        <a href="#" className="fp">Forgot password?</a>

        <div className="footer_card">
          <p>Not a member?</p>
          <a href="/signup">Signup now</a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
