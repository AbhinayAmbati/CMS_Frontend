/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaNewspaper, FaChartBar, FaCog, FaUserPlus, FaComments } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import AdminLayout from '../../Components/AdminLayout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Cookies from 'js-cookie';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    newUsers: 0,
  });

  const [users, setUsers] = useState([]);
  const [contents, setContents] = useState([]);
  const [chartData, setChartData] = useState({
    userGrowth: null,
    contentCategories: null,
    contentByUser: null,
  });
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Fetch all required data
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersResponse, contentsResponse] = await Promise.all([
          fetch(`${API_URL}/api/admin/getallusers`,
            {
              headers: {
                'Authorization': `Bearer ${Cookies.get('token')}`
              }
            }
          ),
          fetch(`${API_URL}/api/content/getallcontent`,
            {
              headers: {
                'Authorization': `Bearer ${Cookies.get('token')}`
              }
            }
          )
        ]);

        const usersData = await usersResponse.json();
        const contentsData = await contentsResponse.json();

        // Ensure we're working with arrays
        const usersArray = Array.isArray(usersData) ? usersData : [];
        const contentsArray = Array.isArray(contentsData) ? contentsData : [];

        setUsers(usersArray);
        setContents(contentsArray);
        
        // Process data for statistics
        processData(usersArray, contentsArray);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set default empty arrays on error
        setUsers([]);
        setContents([]);
        // Reset stats on error
        setStats({
          totalUsers: 0,
          totalPosts: 0,
          totalComments: 0,
          newUsers: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (usersData, contentsData) => {
    // Ensure inputs are arrays
    if (!Array.isArray(usersData) || !Array.isArray(contentsData)) {
      console.error('Invalid data format for processData:', { usersData, contentsData });
      return;
    }

    // Calculate basic stats
    const totalUsers = usersData.length;
    const totalPosts = contentsData.length;
    
    const verifiedUsers = usersData.filter(user => user && user.verified).length;
    // eslint-disable-next-line no-unused-vars
    const nonVerifiedUsers = totalUsers - verifiedUsers;
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newUsersCount = usersData.filter(user => {
      return true; 
    }).length;
    
    // Group content by users for the bar chart
    const userContentCounts = {};
    contentsData.forEach(content => {
      if (!content || !content.author) return;
      
      const authorName = content.author;
      if (!userContentCounts[authorName]) {
        userContentCounts[authorName] = 0;
      }
      userContentCounts[authorName]++;
    });
    
    const months = [];
    const currentMonth = now.getMonth();
    for (let i = 5; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      months.push(new Date(0, month).toLocaleString('default', { month: 'short' }));
    }
    
    const userGrowthData = {
      labels: months,
      datasets: [
        {
          label: 'User Growth',
          data: months.map((_, index) => Math.floor(totalUsers * (0.5 + index * 0.1))),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
    
    
    // Prepare content by user data
    const contentByUser = {
      labels: Object.keys(userContentCounts),
      datasets: [
        {
          label: 'Content Count',
          data: Object.values(userContentCounts),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    // Count users with admin privileges vs regular users
    const adminUsers = usersData.filter(user => user && user.admin).length;
    const regularUsers = totalUsers - adminUsers;
    
    const userTypesData = {
      labels: ['Admin Users', 'Regular Users'],
      datasets: [
        {
          data: [adminUsers, regularUsers],
          backgroundColor: [
            'rgba(255, 159, 64, 0.7)',
            'rgba(153, 102, 255, 0.7)',
          ],
          borderColor: [
            'rgba(255, 159, 64, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    // Update state with processed data
    setStats({
      totalUsers,
      totalPosts,
      totalComments: 0, // Placeholder as we don't have comment data
      newUsers: newUsersCount,
    });
    
    setChartData({
      userGrowth: userGrowthData,
      contentByUser,
      userTypes: userTypesData
    });
  };

  const adminModules = [
    {
      id: 1,
      title: "User Management",
      description: "Manage user accounts, roles and permissions",
      icon: <FaUsers className="text-3xl text-gray-700" />,
      path: "/admin/users",
      count: stats.totalUsers,
    },
    {
      id: 2,
      title: "Content Management",
      description: "Manage blog posts, pages and media",
      icon: <FaNewspaper className="text-3xl text-gray-700" />,
      path: "/admin/content",
      count: stats.totalPosts,
    },
    {
      id: 3,
      title: "Analytics",
      description: "View site traffic and user engagement metrics",
      icon: <FaChartBar className="text-3xl text-gray-700" />,
      path: "/admin/analytics",
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>

          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-[200px] sm:h-[300px] bg-gray-100 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-[200px] sm:h-[300px] bg-gray-100 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Recent Content Table Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[...Array(3)].map((_, index) => (
                      <th key={index} className="px-4 sm:px-6 py-3">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index}>
                      {[...Array(3)].map((_, cellIndex) => (
                        <td key={cellIndex} className="px-4 sm:px-6 py-4">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Modules Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Safely get the count of admin and verified users
  const safeGetAdminCount = () => {
    if (!Array.isArray(users)) return 0;
    return users.filter(user => user && user.admin).length;
  };
  
  const safeGetVerifiedCount = () => {
    if (!Array.isArray(users)) return 0;
    return users.filter(user => user && user.verified).length;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Welcome to your CMS dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-full">
                <FaUsers className="text-blue-500 text-lg sm:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-full">
                <FaNewspaper className="text-green-500 text-lg sm:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Admin Users</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{safeGetAdminCount()}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-full">
                <FaUserPlus className="text-purple-500 text-lg sm:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Verified Users</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{safeGetVerifiedCount()}</p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-50 rounded-full">
                <FaUserPlus className="text-yellow-500 text-lg sm:text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">User Growth</h3>
            <div className="h-[200px] sm:h-[300px]">
              {chartData.userGrowth && <Line data={chartData.userGrowth} options={{ maintainAspectRatio: false }} />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Content by User</h3>
            <div className="h-[200px] sm:h-[300px]">
              {chartData.contentByUser && <Bar data={chartData.contentByUser} options={{ maintainAspectRatio: false }} />}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6"> 
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">User Types</h3>
            <div className="h-[200px] sm:h-[300px]">
              {chartData.userTypes && <Doughnut data={chartData.userTypes} options={{ maintainAspectRatio: false }} />}
            </div>
          </div>
        </div>

        {/* Recent Content Preview */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Recent Content</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(contents) && contents.slice(0, 5).map((content) => (
                    <tr key={content?.id || Math.random()}>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{content?.title || 'Untitled'}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500">{content?.author || 'Unknown'}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {content?.date || 'No date'}
                      </td>
                    </tr>
                  ))}
                  {(!Array.isArray(contents) || contents.length === 0) && (
                    <tr>
                      <td colSpan="3" className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm text-gray-500">
                        No content available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Admin Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {adminModules.map((module) => (
            <Link 
              key={module.id} 
              to={module.path}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                  {module.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{module.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">{module.description}</p>
                {module.count !== undefined && (
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{module.count}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;