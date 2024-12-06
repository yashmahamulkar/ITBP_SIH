import React, { useState } from 'react';
import '../static/signup.css';
import logo from '../static/images/raysoniclogo.png';
import { useNavigate } from 'react-router-dom'; 
const SignupForm = () => {
  const navigate = useNavigate(); 
  // State for form fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phonenumber: '',
    gender: '',
  });

  // State for errors
  const [errors, setErrors] = useState({});
  // State for backend messages
  const [message, setMessage] = useState('');

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Form validation
  const validateForm = () => {
    let formErrors = {};
    
    if (!formData.username) {
      formErrors.username = 'Username is required';
    }
    if (!formData.email) {
      formErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      formErrors.password = 'Password is required';
    }
    if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = 'Passwords must match';
    }
    if (!formData.phonenumber) {
      formErrors.phonenumber = 'Phone number is required';
    }
    if (!formData.gender) {
      formErrors.gender = 'Gender selection is required';
    }

    setErrors(formErrors);

    return Object.keys(formErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const formDataToSend = new URLSearchParams();
        for (const [key, value] of Object.entries(formData)) {
          formDataToSend.append(key, value);
        }

        const response = await fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formDataToSend.toString(),
        });

        const result = await response.json();

        if (response.ok) {
          setMessage(result.message);
          setTimeout(() => {
            navigate('/login');
          }, 2000); 
          // Optionally, redirect or perform other actions on success
          // window.location.href = '/login';
        } else {
          console.error('Form submission failed:', result.message);
          setMessage(result.message);
          setErrors(result.errors || {});
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="outer">
      <div className="card">
        <div className="image_container">
          <img src={logo} alt="Signup" className="login_image" />
        </div>
        <div className="signup_register">
          <a href="/login" className="login">Login</a>
          <a href="/signup" className="register">Signup</a>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <p className="error">{errors.username}</p>}
          
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="pass"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}
          
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="confirm_pass"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          
          <input
            type="text"
            name="phonenumber"
            placeholder="Phone Number"
            className="phonenumber"
            value={formData.phonenumber}
            onChange={handleChange}
            required
          />
          {errors.phonenumber && <p className="error">{errors.phonenumber}</p>}
          
          <select
            name="gender"
            className="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <p className="error">{errors.gender}</p>}
          
          <button type="submit" className="login_btn">Signup</button>
        </form>

        {message && <div className="message">{message}</div>}
        <a href="#" className="fp">Forgot password?</a>
      </div>
    </div>
  );
};

export default SignupForm;
