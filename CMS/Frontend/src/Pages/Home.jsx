import React from 'react';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaUsers, FaChartBar, FaLock } from 'react-icons/fa';
import Cookies from 'js-cookie';

const Home = () => {
  const isLoggedIn = !!Cookies.get('token');

  return (
    <div className="bg-black min-h-[calc(100vh-70px)]  text-white">
      
      <div className="">
        <div className="container mx-auto px-6 py-32">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Content Management System
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                A powerful platform for managing and publishing your content with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/signup"
                      className="bg-white text-black px-8 py-3 rounded-none font-medium hover:bg-gray-200 transition duration-300 text-center"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="border border-white text-white px-8 py-3 rounded-none font-medium hover:bg-white hover:text-black transition duration-300 text-center"
                    >
                      Login
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    className="bg-white text-black px-8 py-3 rounded-none font-medium hover:bg-gray-200 transition duration-300 text-center"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="/hero-image.svg"
                alt="CMS Illustration"
                className="w-full max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;