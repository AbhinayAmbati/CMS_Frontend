import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiCalendar, FiUser } from 'react-icons/fi';
import axios from 'axios';

const Content = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [sorting, setSorting] = useState('newest'); // 'newest', 'oldest', 'alphabetical'
  const [authors, setAuthors] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Fetch all content from backend API when component mounts
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/content/getallcontent`);
        
        const blogData = response.data;
        setBlogs(blogData);
        
        // Extract unique authors for the filter dropdown
        const uniqueAuthors = [...new Set(blogData.map(blog => blog.author))];
        setAuthors(uniqueAuthors);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load articles. Please try again later.');
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Sort and filter blogs
  const processedBlogs = () => {
    // First filter by search term
    let filtered = blogs.filter(blog =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Then filter by author if needed
    if (filterAuthor) {
      filtered = filtered.filter(blog => blog.author === filterAuthor);
    }
    
    // Sort the results
    switch (sorting) {
      case 'oldest':
        return [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'alphabetical':
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      case 'newest':
      default:
        return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setFilterAuthor('');
    setSorting('newest');
  };

  // Process blog data to display
  const filteredBlogs = processedBlogs();

  // Extract excerpt from content data if not explicitly provided
  const getExcerpt = (blog) => {
    if (blog.excerpt) return blog.excerpt;
    
    // Try to extract from data if it's a JSON string
    try {
      if (blog.data && typeof blog.data === 'string') {
        const parsedData = JSON.parse(blog.data);
        if (parsedData.content && parsedData.content.blocks) {
          // Find first paragraph
          const firstParagraph = parsedData.content.blocks.find(block => block.type === 'paragraph');
          if (firstParagraph && firstParagraph.data.text) {
            return firstParagraph.data.text.substring(0, 150) + '...';
          }
        }
      }
    } catch (e) {
      // If parsing fails or no paragraph found, return a placeholder
      console.log(e);
      return "Read more about this article..." ;
    }
    
    return "Read more about this article...";
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-xl">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Blog Articles</h1>
        
        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
              />
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            {/* Author Filter */}
            <div className="relative">
              <select 
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors appearance-none"
              >
                <option value="">All Authors</option>
                {authors.map((author, index) => (
                  <option key={index} value={author}>{author}</option>
                ))}
              </select>
              <FiUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            {/* Sort */}
            <div className="relative">
              <select
                value={sorting}
                onChange={(e) => setSorting(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">A-Z</option>
              </select>
              <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          {/* Reset filters */}
          {(searchQuery || filterAuthor || sorting !== 'newest') && (
            <div className="text-right">
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-black"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <Link key={blog.id} to={`/content/${blog.id}`} className="group">
              <div className="bg-white rounded-lg border border-gray-200 hover:border-black transition-colors h-full flex flex-col">
                <div className="relative aspect-[16/9]">
                  <img 
                    src={blog.image || '/placeholder-image.jpg'} 
                    alt={blog.title}
                    className="w-full h-full object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {getExcerpt(blog)}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-auto">
                    <FiUser className="mr-1" />
                    <span>{blog.author}</span>
                    <span className="mx-2">•</span>
                    <FiCalendar className="mr-1" />
                    <span>{blog.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-600 mb-4">No articles found matching your search.</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;