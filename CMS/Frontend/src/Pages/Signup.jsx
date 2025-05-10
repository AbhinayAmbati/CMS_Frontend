import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaGithub, FaTwitter, FaUser } from 'react-icons/fa';
import axios from 'axios';
import Cookies from 'js-cookie';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [signupError, setSignupError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitiateSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setSignupError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup/initiate`, {
        email: formData.email,
        username: formData.name,
        password: formData.password
      });
      console.log('Signup response:', response.data);
      setShowOtpForm(true);
      
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response && error.response.status === 409) {
        setSignupError('This email is already registered. Please use a different email or try logging in.');
      } else {
        setSignupError(
          error.response?.data?.message || 
          'An error occurred during signup. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      setErrors({ otp: 'OTP is required' });
      return;
    }
    
    setIsLoading(true);
    setSignupError('');
    
    try {
      // Include userId if available in the request payload
      const payload = {
        email: formData.email,
        otp: otp.trim() // Ensure OTP is trimmed of any whitespace
      };
      
      
      // Log the payload for debugging
      console.log('Sending OTP verification payload:', payload);
      
      const response = await axios.post(`${API_URL}/api/auth/signup/verify`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('OTP verification response:', response.data);
      
      // Check if the response has a token (which indicates success)
      if (response.data.token) {
        // Store the token in localStorage for authentication
        Cookies.set('token', response.data.token);
        
        // Store user data if needed
        if (response.data.user) {
          Cookies.set('userData', JSON.stringify({
            id: response.data.user.id,
            username: response.data.user.username,
            email: response.data.user.email,
            verified: response.data.user.verified
          }));
        }
        
        navigate('/dashboard', { 
          state: { message: response.data.message || 'Registration successful! Welcome aboard.' } 
        });
      } else if (response.data.success) {
        navigate('/dashboard', { 
          state: { message: response.data.message || 'Registration successful! Welcome aboard.' } 
        });
      } else {
        setSignupError(response.data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        if (error.response.status === 400) {
          setSignupError('Invalid or expired OTP. Please request a new one.');
        } else if (error.response.status === 404) {
          setSignupError('User not found. Please sign up again.');
        } else {
          setSignupError(error.response.data.message || 'Verification failed. Please try again.');
        }
      } else if (error.request) {
        // Request was made but no response received
        setSignupError('Server is not responding. Please try again later.');
      } else {
        // Something happened in setting up the request
        setSignupError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setSignupError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email: formData.email
      });
      
      if (response.data.success) {
        // Show success message
        alert('A new verification code has been sent to your email.');
      } else {
        setSignupError(response.data.message || 'Failed to resend verification code.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setSignupError(
        error.response?.data?.message || 
        'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm w-full max-w-md">
        
        <div className="flex border-b mb-6">
          <Link to="/login" className="w-1/2 pb-2 text-center text-gray-500 hover:text-gray-700">
            Sign In
          </Link>
          <div className="w-1/2 pb-2 text-center border-b-2 border-gray-800 font-medium">
            Sign Up
          </div>
        </div>

        {signupError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {signupError}
          </div>
        )}

        {!showOtpForm ? (
          <form className="space-y-4" onSubmit={handleInitiateSignup}>
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-1 text-sm sm:text-base">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FaUser />
                </span>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full pl-10 pr-3 py-2 text-sm sm:text-base border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
              {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1 text-sm sm:text-base">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-3 py-2 text-sm sm:text-base border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
              {errors.email && <p className="mt-1 text-red-500 text-xs">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1 text-sm sm:text-base">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FaLock />
                </span>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={`w-full pl-10 pr-3 py-2 text-sm sm:text-base border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
              {errors.password && <p className="mt-1 text-red-500 text-xs">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-1 text-sm sm:text-base">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FaLock />
                </span>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-3 py-2 text-sm sm:text-base border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-red-500 text-xs">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start sm:items-center">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                className={`h-4 w-4 mt-1 sm:mt-0 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${errors.terms ? 'border-red-500' : ''}`}
              />
              <label htmlFor="terms" className="ml-2 block text-xs sm:text-sm text-gray-700">
                I agree to the <Link to="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && <p className="mt-1 text-red-500 text-xs">{errors.terms}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white rounded-md py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base disabled:bg-gray-400"
            >
              {isLoading ? 'Processing...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleOtpVerification}>
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Verify Your Email</h3>
              <p className="text-sm text-gray-600 mt-1">
                We've sent a verification code to {formData.email}
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="block text-gray-700 mb-1 text-sm sm:text-base">Verification Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter verification code"
                className={`w-full px-3 py-2 text-sm sm:text-base border ${errors.otp ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              {errors.otp && <p className="mt-1 text-red-500 text-xs">{errors.otp}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white rounded-md py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base disabled:bg-gray-400"
            >
              {isLoading ? 'Verifying...' : 'Verify & Complete Signup'}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button 
                  type="button" 
                  onClick={handleResendOtp} 
                  disabled={isLoading}
                  className="text-blue-600 hover:underline"
                >
                  Resend Code
                </button>
              </p>
              
              <button 
                type="button" 
                onClick={() => setShowOtpForm(false)} 
                className="text-blue-600 hover:underline text-sm"
              >
                Go back to signup form
              </button>
            </div>
          </form>
        )}

        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;