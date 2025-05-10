import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaTimes, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import AdminLayout from '../../Components/AdminLayout';
import { toast } from 'react-toastify';
import ContentEditor from '../../Components/ContentEditor';
import Cookies from 'js-cookie';

const ContentManagement = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [isCreateMode, setIsCreateMode] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/content/getallcontent`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setContent(response.data);
    } catch (error) {
      setError('Failed to fetch content: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchContentByAuthor = async (authorId) => {
    if (!authorId) {
      // If no author ID provided, fetch all content
      return fetchContent();
    }
    
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/content/author/${authorId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setContent(response.data);
    } catch (error) {
      setError('Failed to fetch content by author: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchContentByUser = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/content/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent(response.data);
    } catch (error) {
      setError('Failed to fetch your content: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (contentId) => {
    try {
      setLoading(true);
      setIsCreateMode(false);
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/api/content/${contentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setCurrentContent(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load content: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsCreateMode(true);
    setCurrentContent({
      title: '',
      excerpt: '',
      data: '',
      image: null
    });
    setShowModal(true);
  };

  const handleSave = async (postData) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('excerpt', postData.excerpt || '');
      formData.append('data', postData.data || '');
      
      // Add the image file if provided
      if (postData.image && typeof postData.image !== 'string') {
        formData.append('image', postData.image);
      }
      
      if (isCreateMode) {
        // Create new content
        await axios.post(
          `${API_URL}/api/content/addcontent`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast.success('Content created successfully');
      } else {
        // Update existing content
        await axios.put(
          `${API_URL}/api/content/update/${postData.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast.success('Content updated successfully');
      }
      
      setShowModal(false);
      fetchContent();
    } catch (error) {
      toast.error('Error: ' + (error.response?.data || error.message));
    }
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = Cookies.get('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      await axios.delete(`${API_URL}/api/content/delete/${contentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Content deleted successfully');
      fetchContent();
    } catch (error) {
      toast.error('Failed to delete content: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentContent(null);
  };

  const handleFilterChange = (e) => {
    setFilterAuthor(e.target.value);
  };

  const handleApplyFilter = () => {
    if (!filterAuthor.trim()) {
      fetchContent();
    } else {
      fetchContentByAuthor(filterAuthor);
    }
  };

  const handleShowMyContent = () => {
    fetchContentByUser();
  };

  // Loading skeleton
  if (loading && content.length === 0) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Content Management</h1>
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center gap-2 transition-colors"
          >
            <FaPlus size={14} />
            <span>Add New Content</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="author-id" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Author ID
                </label>
                <input
                  type="text"
                  id="author-id"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterAuthor}
                  onChange={handleFilterChange}
                  placeholder="Author ID"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleApplyFilter}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                >
                  Apply Filter
                </button>
                <button
                  onClick={handleShowMyContent}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                >
                  My Content
                </button>
                <button
                  onClick={fetchContent}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors"
                >
                  Show All
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {content.length > 0 ? (
                  content.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center">
                          {item.image && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={typeof item.image === 'string' ? item.image : URL.createObjectURL(item.image)} 
                                alt={item.title} 
                              />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {item.author}
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {item.date}
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {item.updatedAt || '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <a
                            href={`/content/${item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="View"
                          >
                            <FaEye />
                          </a>
                          <button
                            onClick={() => openEditModal(item.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 sm:px-6 py-4 text-center text-gray-500">
                      No content found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal with ContentEditor */}
      {showModal && currentContent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isCreateMode ? 'Create New Content' : 'Edit Content'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                
                {/* Content Editor Component */}
                <ContentEditor 
                  initialData={currentContent} 
                  onSave={handleSave}
                  isCreateMode={isCreateMode}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ContentManagement;