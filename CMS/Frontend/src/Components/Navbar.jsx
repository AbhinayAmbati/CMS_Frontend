import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaUser, FaHome, FaNewspaper, FaTachometerAlt, FaUserShield, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import axios from 'axios';
import Cookies from 'js-cookie';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) return;

      const response = await axios.get(
        `${API_URL}/api/user/getuserdetails`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data) {
        setUserProfile(response.data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  // Define navigation links based on authentication status
  const getNavLinks = () => {
    const links = [
      { id: 1, title: "Home", path: "/", icon: <FaHome className="w-5 h-5" /> },
      { id: 2, title: "Content", path: "/content", icon: <FaNewspaper className="w-5 h-5" /> },
    ];

    if (currentUser) {
      links.push({ id: 3, title: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt className="w-5 h-5" /> });
      
      if (isAdmin()) {
        links.push({ id: 4, title: "Admin", path: "/admin", icon: <FaUserShield className="w-5 h-5" /> });
      }
    }
    
    return links;
  };

  const navLinks = getNavLinks();

  return (
    <>
      <div className='fixed top-0 left-0 right-0 flex justify-between items-center bg-white py-4 w-full px-8 shadow-sm z-50'>
        <Link to="/" className='text-3xl font-bold tracking-tight hover:text-gray-700 transition-colors'>
          <h1>CMS</h1>
        </Link>
        
        <div className='hidden md:flex items-center gap-8'>
          {navLinks.map((link) => (
            <Link key={link.id} to={link.path} className='text-gray-600 hover:text-black font-medium transition-colors flex items-center gap-2'>
              {link.icon}
              {link.title}
            </Link>
          ))}
        </div>
        
        <div className='hidden md:flex items-center gap-4'> 
          {currentUser ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-gray-200 px-4 py-2 rounded-full">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white ring-2 ring-gray-700 flex items-center justify-center">
                  {userProfile?.profileImage ? (
                    <img 
                      src={userProfile.profileImage} 
                      alt={userProfile.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-gray-600" />
                  )}
                </div>
                <span className="text-gray-700 font-medium text-sm">{userProfile?.username || currentUser.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className='px-4 py-2 text-gray-600 hover:text-black font-medium transition-colors cursor-pointer hover:bg-gray-50 rounded-lg flex items-center gap-2'
              >
                <FaSignOutAlt className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className='px-4 py-2 text-gray-600 hover:text-black font-medium transition-colors'>Login</Link>
              <Link to="/signup" className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium'>Signup</Link>
            </>
          )}
        </div>
        
        <button 
          className='md:hidden text-gray-600 focus:outline-none'
          onClick={toggleMenu}
        >
          <FaBars size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-full bg-white shadow-lg z-[60] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end p-4">
          <button 
            onClick={toggleMenu}
            className="text-gray-600 focus:outline-none"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className="flex flex-col px-6 py-4">
          <Link 
            to="/" 
            className='text-2xl font-bold mb-8'
            onClick={toggleMenu}
          >
            CMS
          </Link>
          
          <div className="flex flex-col space-y-4 mb-8">
            {navLinks.map((link) => (
              <Link 
                key={link.id} 
                to={link.path} 
                className='text-gray-600 hover:text-black font-medium transition-colors flex items-center gap-2'
                onClick={toggleMenu}
              >
                {link.icon}
                {link.title}
              </Link>
            ))}
          </div>
          
          <div className="flex flex-col space-y-3 mt-auto">
            {currentUser ? (
              <>
                <div className="flex items-center gap-3 bg-gray-200 px-4 py-3 rounded-lg mb-4">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white ring-2 ring-gray-700 flex items-center justify-center">
                    {userProfile?.profileImage ? (
                      <img 
                        src={userProfile.profileImage} 
                        alt={userProfile.username} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-gray-600" />
                    )}
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{userProfile?.username || currentUser.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className='px-4 py-2 text-gray-600 hover:text-black font-medium transition-colors w-full text-center hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2'
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className='px-4 py-2 text-gray-600 hover:text-black font-medium transition-colors w-full text-center'
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium w-full text-center'
                  onClick={toggleMenu}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[55]"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;