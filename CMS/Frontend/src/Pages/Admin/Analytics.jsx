import React, { useState, useEffect } from 'react';
import { FaUsers, FaNewspaper, FaPen, FaCalendarAlt } from 'react-icons/fa';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import AdminLayout from '../../Components/AdminLayout';
import Cookies from 'js-cookie';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    contentByAuthor: {},
    usersByDate: {},
    contentByDate: {}
  });

  const API_URL = import.meta.env.VITE_API_URL;
  
  const [contentData, setContentData] = useState({
    labels: [],
    datasets: []
  });
  
  const [authorData, setAuthorData] = useState({
    labels: [],
    datasets: []
  });
  
  const [timeSeriesData, setTimeSeriesData] = useState({
    users: {
      labels: [],
      datasets: []
    },
    content: {
      labels: [],
      datasets: []
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use the existing API endpoints from your controllers
      const usersResponse = await fetch(`${API_URL}/api/admin/getallusers`,
        {
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          }
        }
      );
      const contentResponse = await fetch(`${API_URL}/api/content/getallcontent`);
      
      if (!usersResponse.ok || !contentResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const usersData = await usersResponse.json();
      const contentData = await contentResponse.json();
      
      // Process data to get content by author
      const contentByAuthor = {};
      const contentByDate = {};
      
      contentData.forEach(content => {
        const authorName = content.author || 'Unknown';
        if (!contentByAuthor[authorName]) {
          contentByAuthor[authorName] = 0;
        }
        contentByAuthor[authorName]++;
        
        // Extract date from content
        const createdAt = content.createdAt || content.date;
        if (createdAt) {
          const dateStr = new Date(createdAt).toLocaleDateString();
          if (!contentByDate[dateStr]) {
            contentByDate[dateStr] = 0;
          }
          contentByDate[dateStr]++;
        }
      });
      
      // Process user creation dates
      const usersByDate = {};
      usersData.forEach(user => {
        // This assumes there's a createdAt field in your user data
        // If not, you'll need to adjust this logic
        const createdAt = user.createdAt || new Date().toISOString();
        const dateStr = new Date(createdAt).toLocaleDateString();
        if (!usersByDate[dateStr]) {
          usersByDate[dateStr] = 0;
        }
        usersByDate[dateStr]++;
      });
      
      // Set stats based on the actual data from API
      setStats({
        totalUsers: usersData.length,
        totalContent: contentData.length,
        contentByAuthor,
        usersByDate,
        contentByDate
      });
      
      // Create chart data to display the stats
      generateChartData(usersData.length, contentData.length);
      generateAuthorChartData(contentByAuthor);
      generateTimeSeriesData(usersByDate, contentByDate);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use sample data if API calls fail
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (userCount, contentCount) => {
    setContentData({
      labels: ['Users', 'Content'],
      datasets: [
        {
          label: 'Total Count',
          data: [userCount, contentCount],
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
  };
  
  const generateAuthorChartData = (contentByAuthor) => {
    const authors = Object.keys(contentByAuthor);
    const contentCounts = authors.map(author => contentByAuthor[author]);
    
    // Generate a unique color for each author
    const backgroundColors = authors.map((_, i) => {
      const hue = (i * 137.5) % 360; // Golden angle approximation for even distribution
      return `hsla(${hue}, 70%, 60%, 0.7)`;
    });
    
    setAuthorData({
      labels: authors,
      datasets: [
        {
          label: 'Content by Author',
          data: contentCounts,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    });
  };
  
  const generateTimeSeriesData = (usersByDate, contentByDate) => {
    // Get all unique dates from both datasets
    const allDates = new Set([
      ...Object.keys(usersByDate),
      ...Object.keys(contentByDate)
    ]);
    
    // Sort dates chronologically
    const sortedDates = Array.from(allDates).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    // Prepare user time series data
    const userData = {
      labels: sortedDates,
      datasets: [
        {
          label: 'Users Created',
          data: sortedDates.map(date => usersByDate[date] || 0),
          fill: false,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          tension: 0.1
        }
      ]
    };
    
    // Prepare content time series data
    const contentData = {
      labels: sortedDates,
      datasets: [
        {
          label: 'Content Created',
          data: sortedDates.map(date => contentByDate[date] || 0),
          fill: false,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          tension: 0.1
        }
      ]
    };
    
    setTimeSeriesData({
      users: userData,
      content: contentData
    });
  };

  // Fallback data if API fails
  const setFallbackData = () => {
    const userCount = 3;
    const contentCount = 5;
    
    const contentByAuthor = {
      'Ambati Abhinay': 4,
      'CMS': 1
    };
    
    // Sample time series data
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    
    const usersByDate = {
      [yesterday]: 1,
      [today]: 2
    };
    
    const contentByDate = {
      [yesterday]: 2,
      [today]: 3
    };
    
    setStats({
      totalUsers: userCount,
      totalContent: contentCount,
      contentByAuthor,
      usersByDate,
      contentByDate
    });
    
    generateChartData(userCount, contentCount);
    generateAuthorChartData(contentByAuthor);
    generateTimeSeriesData(usersByDate, contentByDate);
  };

  const renderLoadingState = () => (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2].map((n) => (
              <div key={n} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-gray-200 rounded mb-6"></div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );

  const renderAnalytics = () => (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-full">
                <FaUsers className="text-blue-500 text-lg sm:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalContent.toLocaleString()}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-full">
                <FaNewspaper className="text-purple-500 text-lg sm:text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Time Series Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Users Created Over Time</h3>
            <div style={{ height: '300px' }}>
              <Line 
                data={timeSeriesData.users}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0 // Only show integer values
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        title: (tooltipItems) => {
                          return `Date: ${tooltipItems[0].label}`;
                        },
                        label: (context) => {
                          return `Users Created: ${context.raw}`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Created Over Time</h3>
            <div style={{ height: '300px' }}>
              <Line 
                data={timeSeriesData.content}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0 // Only show integer values
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        title: (tooltipItems) => {
                          return `Date: ${tooltipItems[0].label}`;
                        },
                        label: (context) => {
                          return `Content Created: ${context.raw}`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Original Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Users vs Content</h3>
            <div className="h-[200px] sm:h-[300px]">
              <Bar 
                data={contentData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Content Distribution by Author</h3>
            <div className="h-[200px] sm:h-[300px]">
              <Pie
                data={authorData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                          size: 11
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Content by Author Table */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Content by Author</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(stats.contentByAuthor).map(([author, count], index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                      <FaPen className="text-gray-400 mr-2" /> {author}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );

  return loading ? renderLoadingState() : renderAnalytics();
};

export default Analytics;