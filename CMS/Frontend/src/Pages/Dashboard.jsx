import React, { useState, useEffect } from 'react';
import { FaFolder, FaEye, FaNewspaper, FaCode, FaRegEdit, FaCommentAlt, FaUser, FaTimes, FaTrash, FaPencilAlt, FaLock, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ContentEditor from '../Components/ContentEditor';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const [userData, setUserData] = useState({
    username: "User",
    email: "",
    profileImage: "https://imgs.search.brave.com/Wy9yeON3-cT0jG1XYVChtQhRHqReCB8MUuscX8tdfx0/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTEz/MTE2NDU0OC92ZWN0/b3IvYXZhdGFyLTUu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PUNLNDlTaExKd0R4/RTRraXJvQ1I0Mmtp/bVR1dWh2dW8yRkg1/eV82YVNnRW89", 
  });
  const [successMessage, setSuccessMessage] = useState('');

  // State for email update flow
  const [otpSent, setOtpSent] = useState(false);
  const [emailData, setEmailData] = useState({
    newEmail: '',
    otp: ''
  });

  const {logout} = useAuth();
  const navigate = useNavigate();

  // Fetch user posts and profile info on component mount
  useEffect(() => {
    fetchUserPosts();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await axios.get(
        `${API_URL}/api/user/getuserdetails`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data) {
        setUserData(response.data);
      }
      console.log(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Don't set error - we don't want to disrupt the entire dashboard if just profile fetch fails
    }
  };

  const fetchUserPosts = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${API_URL}/api/content/user`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setRecentPosts(response.data || []);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load your content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = () => {
    setSelectedPost(null);
    setShowBlogEditor(true);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setShowBlogEditor(true);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      await axios.delete(
        `${API_URL}/api/content/delete/${postId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Update local state
      setRecentPosts(recentPosts.filter(post => post.id !== postId));
      
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    }
  };

  const handleSavePost = async (postData) => {
    setError('');
    
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      // Create a FormData object for the API request
      const formData = new FormData();
      
      // Explicitly set all fields
      formData.append('title', postData.title);
      formData.append('excerpt', postData.excerpt || '');
      formData.append('data', postData.data || '{}');
      
      // For update operations where we have a coverImage URL and no new file
      if (postData.coverImage && !postData.image) {
        formData.append('coverImage', postData.coverImage);
      }
      
      // For operations with a new cover image file
      if (postData.image && postData.image instanceof File) {
        formData.append('image', postData.image);
        console.log('Adding image file to request:', postData.image.name);
      }
      
      // Log what we're sending to help with debugging
      console.log('Form data being sent for post save/update:');
      for (let pair of formData.entries()) {
        if (pair[0] === 'image') {
          console.log(`${pair[0]}: [File object - ${pair[1].name}]`);
        } else if (pair[0] === 'data') {
          console.log(`${pair[0]}: [Large JSON data]`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      let response;
      
      if (postData.id) {
        // Update existing post
        console.log(`Sending PUT request to ${API_URL}/api/content/update/${postData.id}`);
        response = await axios.put(
          `${API_URL}/api/content/update/${postData.id}`,
          formData,
          config
        );
      } else {
        // Create new post
        console.log(`Sending POST request to ${API_URL}/api/content/addcontent`);
        response = await axios.post(
          `${API_URL}/api/content/addcontent`,
          formData,
          config
        );
      }
      
      console.log('API response:', response.data);
      
      setShowBlogEditor(false);
      // Refresh the posts list to show the latest changes
      await fetchUserPosts();
      
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Failed to save post. Please try again.');
    } 
  };

  const handleUpdateProfile = async (profileData) => {
    setError('');
    setSuccessMessage('');
    
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
  
      // Create a FormData object for the image file
      const formData = new FormData();
      
      // Add user data as JSON string
      const userDataToSend = {
        username: profileData.username,
        email: userData.email, // Use the correct reference to userData
      };
      
      // Append the user data as a JSON string with Content-Type application/json
      formData.append('user', new Blob([JSON.stringify(userDataToSend)], {
        type: 'application/json'
      }));
      
      // Add the image if it exists
      if (profileData.image && profileData.image instanceof File) {
        formData.append('image', profileData.image);
      }
  
      const response = await axios.post(
        `${API_URL}/api/user/updateuser`,
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log(response);
      
      setShowProfileEditor(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Refresh user profile
      await fetchUserProfile();
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };
  
  const initiateEmailUpdate = async (email) => {
    setError('');
    setSuccessMessage('');
    
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/api/user/email/update/initiate`,
        { email },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(response);
      setOtpSent(true);
      setSuccessMessage('OTP sent to your new email address. Please check your inbox.');
      
    } catch (err) {
      console.error('Error initiating email update:', err);
      setError(err.response?.data?.message || 'Failed to initiate email update. Please try again.');
    }
  };
  
  const verifyOtpAndUpdateEmail = async () => {
    setError('');
    setSuccessMessage('');
    
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/api/user/email/update/verify`,
        { 
          email: emailData.newEmail,
          otp: emailData.otp
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(response);
      
      setShowEmailEditor(false);
      setOtpSent(false);
      setEmailData({ newEmail: '', otp: '' });
      setSuccessMessage('Email updated successfully! Please log in again with your new email.');
      
      // Wait for 2 seconds to show the success message before logging out
      setTimeout(() => {
        logout();
      }, 4000);
      
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };
  
  const handleUpdatePassword = async (passwordData) => {
    setError('');
    setSuccessMessage('');
    
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/api/user/updatepassword`,
        { password: passwordData.newPassword },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(response);
      
      setShowPasswordEditor(false);
      setSuccessMessage('Password updated successfully!');
      
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      await axios.delete(
        `${API_URL}/api/user/deleteaccount`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Clear cookies and redirect to home page
      logout();
      navigate('/');
      
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
    }
  };

  // Profile Editor Component
  const ProfileEditor = ({ userData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      username: userData?.username || '',
      image: null
    });
    const [imagePreview, setImagePreview] = useState(userData?.profileImage || null);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, image: file }));
        setImagePreview(URL.createObjectURL(file));
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
          >
            Save Changes
          </button>
        </div>
      </form>
    );
  };

  // Email Update Component
  const EmailEditor = () => {
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setEmailData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitEmail = (e) => {
      e.preventDefault();
      if (!emailData.newEmail) {
        setError('Please enter a new email address');
        return;
      }
      initiateEmailUpdate(emailData.newEmail);
    };

    const handleVerifyOtp = (e) => {
      e.preventDefault();
      if (!emailData.otp) {
        setError('Please enter the verification code');
        return;
      }
      verifyOtpAndUpdateEmail();
    };

    return (
      <div className="space-y-4">
        {!otpSent ? (
          <form onSubmit={handleSubmitEmail} className="space-y-4">
            <div>
              <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-700 mb-1">Current Email</label>
              <input
                type="email"
                id="currentEmail"
                value={userData.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                disabled
              />
            </div>
            
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">New Email</label>
              <input
                type="email"
                id="newEmail"
                name="newEmail"
                value={emailData.newEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
                placeholder="Enter new email address"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEmailEditor(false);
                  setEmailData({ newEmail: '', otp: '' });
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
              >
                Send Verification Code
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">Enter Verification Code</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={emailData.otp}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
                placeholder="Enter verification code"
              />
              <p className="mt-1 text-sm text-gray-500">
                We've sent a verification code to {emailData.newEmail}. Please check your inbox and enter the code above.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setEmailData(prev => ({ ...prev, otp: '' }));
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
              >
                Verify & Update
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  // Password Update Component
  const PasswordEditor = () => {
    const [passwordData, setPasswordData] = useState({
      newPassword: '',
      confirmPassword: ''
    });

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      handleUpdatePassword(passwordData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
            required
            minLength="6"
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
            required
          />
          {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              Passwords do not match
            </p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowPasswordEditor(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
            disabled={!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
          >
            Update Password
          </button>
        </div>
      </form>
    );
  };

  // Calculate stats data
  const statsData = [
    { id: 2, title: "Blog Posts", value: recentPosts.length.toString(), icon: <FaNewspaper className="text-gray-500" /> },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showBlogEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {selectedPost ? 'Edit Post' : 'Create New Post'}
              </h3>
              <button 
                onClick={() => setShowBlogEditor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <ContentEditor 
              initialData={selectedPost}
              onSave={handleSavePost}
            />
          </div>
        </div>
      )}

      {showProfileEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Profile</h3>
              <button 
                onClick={() => setShowProfileEditor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <ProfileEditor 
              userData={userData}
              onSave={handleUpdateProfile}
              onCancel={() => setShowProfileEditor(false)}
            />
          </div>
        </div>
      )}

      {showEmailEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Update Email Address</h3>
              <button 
                onClick={() => {
                  setShowEmailEditor(false);
                  setOtpSent(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <EmailEditor />
          </div>
        </div>
      )}

      {showPasswordEditor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Change Password</h3>
              <button 
                onClick={() => setShowPasswordEditor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <PasswordEditor />
          </div>
        </div>
      )}

      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-red-600">Delete Account</h3>
              <button 
                onClick={() => setShowDeleteAccountModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
              </p>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
            {successMessage}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 ring-gray-100 relative group">
                <img src={userData.profileImage} alt={userData.username} className="w-full h-full object-cover" />
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setShowProfileEditor(true)}
                >
                  <FaPencilAlt className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{userData.username}</h2>
              <p className="text-gray-600">{userData.email}</p>
              
              <div className="mt-6 space-y-2 w-full">
                <button 
                  onClick={() => setShowProfileEditor(true)}
                  className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg flex items-center justify-center"
                >
                  <FaUser className="mr-2" /> Edit Profile
                </button>
                
                <button 
                  onClick={() => {
                    setShowEmailEditor(true);
                  }}
                  className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg flex items-center justify-center"
                >
                  <FaEnvelope className="mr-2" /> Change Email
                </button>
                
                <button 
                  onClick={() => setShowPasswordEditor(true)}
                  className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg flex items-center justify-center"
                >
                  <FaLock className="mr-2" /> Change Password
                </button>

                <button 
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg flex items-center justify-center"
                >
                  <FaTrash className="mr-2" /> Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsData.map((stat) => (
                <div key={stat.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-medium">{stat.title}</h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">{stat.value}</h2>
                </div>
              ))}
            </div>

            {/* Blog Posts Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Posts</h3>
                <button 
                  onClick={handleCreatePost}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                >
                  Create Post
                </button>
              </div>
              
              {isLoading ? (
                <div className="py-8 text-center text-gray-500">Loading your posts...</div>
              ) : recentPosts.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  You haven't created any posts yet. Click "Create Post" to get started.
                </div>
              ) : (
                <div className="space-y-6">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div>
                        <Link to={`/content/${post.id}`} className="text-lg font-medium text-gray-800 hover:text-gray-600 transition-colors">
                          {post.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">Published on {formatDate(post.date)}</p>
                        <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center"><FaEye className="mr-1" /> {post.views || 0} views</span>
                          <span className="flex items-center"><FaCommentAlt className="mr-1" /> {post.comments?.length || 0} comments</span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleEditPost(post)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <FaRegEdit />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;