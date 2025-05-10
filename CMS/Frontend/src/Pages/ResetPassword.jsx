import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import axios from 'axios';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Verify the token is valid
    const verifyToken = async () => {
      try {
        await axios.get(`${API_URL}/api/auth/verify-reset-token/${token}`);
        setIsValidToken(true);
      } catch (error) {
        setError('This password reset link is invalid or has expired',error);
            
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('No reset token provided');
      setIsLoading(false);
    }
  }, [token, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        newPassword
      });
      setSuccess(true);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-100px)] overflow-hidden bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-100px)] overflow-hidden bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Reset Your Password</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
            {!isValidToken && (
              <div className="mt-2">
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  Return to login
                </Link>
              </div>
            )}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">
            <p>Your password has been reset successfully!</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full mt-4 bg-gray-900 text-white rounded-md py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Proceed to Login
            </button>
          </div>
        ) : isValidToken && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-gray-700 mb-1 text-sm sm:text-base">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FaLock />
                </span>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters
              </p>
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
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white rounded-md py-2 px-4 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base"
            >
              Reset Password
            </button>

            <div className="text-center text-sm">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;