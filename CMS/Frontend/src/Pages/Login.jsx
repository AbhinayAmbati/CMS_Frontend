import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaGithub, FaTwitter } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Match backend endpoint from AuthController
      const response = await axios.post(`${API_URL}/api/auth/signin`, {
        email,
        password
      });
      const data = response.data;
      
      // Login with the correct structure from the API response
      login(data.jwtToken, data.user);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setResetEmailSent(true);
      setError('');
      console.log(response);
    } catch (error) {
      console.log(error);
      setError(error.message || 'Failed to send reset email');
    }
  };

  // Show password reset form
  if (forgotPasswordMode) {
    return (
      <div className="min-h-[calc(100vh-100px)] overflow-hidden bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">Reset Password</h2>
          
          {resetEmailSent ? (
            <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">
              <p>Password reset link has been sent to your email.</p>
              <p className="mt-2">Please check your inbox and follow the instructions.</p>
              <button
                onClick={() => setForgotPasswordMode(false)}
                className="w-full mt-4 bg-gray-900 text-white rounded-md py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <p className="text-gray-600 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form className="space-y-4" onSubmit={handleForgotPassword}>
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-1 text-sm sm:text-base">Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white rounded-md py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base"
                >
                  Send Reset Link
                </button>
                
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(false)}
                  className="w-full bg-white border border-gray-300 text-gray-700 rounded-md py-2 px-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base"
                >
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // Regular login form
  return (
    <div className="min-h-[calc(100vh-100px)] overflow-hidden bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm w-full max-w-md">
        <div className="flex border-b mb-6">
          <div className="w-1/2 pb-2 text-center border-b-2 border-gray-800 font-medium">
            Sign In
          </div>
          <Link to="/signup" className="w-1/2 pb-2 text-center text-gray-500 hover:text-gray-700">
            Sign Up
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
       
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1 text-sm sm:text-base">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <FaEnvelope />
              </span>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
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
                placeholder="Enter your password"
                className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <button 
                type="button"
                onClick={() => setForgotPasswordMode(true)}
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white rounded-md py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base"
          >
            Sign In
          </button>
        </form>

        

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};        

export default Login;