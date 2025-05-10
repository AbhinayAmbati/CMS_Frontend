import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaNewspaper, FaChartBar, FaCog, FaHome } from 'react-icons/fa';

const AdminSidebar = () => {
  const navItems = [
    {
      title: 'Dashboard',
      path: '/admin',
      icon: <FaHome className="w-5 h-5" />,
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: <FaUsers className="w-5 h-5" />,
    },
    {
      title: 'Content Management',
      path: '/admin/content',
      icon: <FaNewspaper className="w-5 h-5" />,
    },
    {
      title: 'Analytics',
      path: '/admin/analytics',
      icon: <FaChartBar className="w-5 h-5" />,
    },
  ];

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col mt-20">
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">CMS Admin</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 sm:px-6 py-3 text-sm sm:text-base text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                isActive ? 'bg-gray-50 text-gray-900 border-r-4 border-black' : ''
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.title}
          </NavLink>
        ))}
      </nav>
      
    </div>
  );
};

export default AdminSidebar; 