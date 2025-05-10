/* eslint-disable no-dupe-else-if */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiCalendar, FiUser, FiEdit, FiTrash2, FiShare2 } from 'react-icons/fi';

const ContentPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [sharing, setSharing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Check if user is logged in and retrieve token
  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  // Check if user is authorized to edit/delete
  const checkOwnership = async (authorId) => {
    const token = getToken();
    if (!token) return false;
    
    try {
      // Get user info from token
      const userResponse = await axios.get(`${API_URL}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if user is admin or author of the post
      if (userResponse.data.admin || userResponse.data.id === authorId) {
        setIsOwner(true);
        return true;
      }
    } catch (err) {
      console.error('Error checking ownership:', err);
    }
    return false;
  };

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/content/${id}`);
        setBlog(response.data);
        checkOwnership(response.data.authorId);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    const token = getToken();
    if (!token) {
      navigate('/login', { state: { from: `/blog/${id}` } });
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/api/content/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate('/blog');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setSharing(true);
    setTimeout(() => setSharing(false), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen pt-24 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-xl">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen pt-24">
        <h1 className="text-2xl font-bold mb-4">
          {error || 'Blog post not found'}
        </h1>
        <Link to="/blog" className="text-black hover:underline flex items-center">
          <FiArrowLeft className="mr-2" /> Back to Blog
        </Link>
      </div>
    );
  }

  // Parse the data field if it contains JSON
  const renderBlogContent = () => {
    if (!blog.data) return null;
    
    try {
      // Check if it's already a parsed object
      const contentData = typeof blog.data === 'string' ? JSON.parse(blog.data) : blog.data;
      
      // Handle EditorJS format
      if (contentData.blocks) {
        return contentData.blocks.map((block, index) => renderContent(block, index));
      } else if (contentData.time && contentData.blocks) {
        return contentData.blocks.map((block, index) => renderContent(block, index));
      }
      
      // Return raw data if we can't determine the format
      return <div className="whitespace-pre-wrap">{typeof blog.data === 'string' ? blog.data : JSON.stringify(blog.data)}</div>;
    } catch (e) {
      console.error('Error parsing blog data:', e);
      // If parsing fails, display as plain text
      return <div className="whitespace-pre-wrap">{blog.data}</div>;
    }
  };

  const renderContent = (block, index) => {
    if (!block || !block.type) return null;
    
    switch (block.type) {
      case 'header':
        { const HeaderTag = `h${block.data.level}`;
        return (
          <HeaderTag key={index} className={`font-bold mb-4 ${block.data.level === 1 ? 'text-3xl' : block.data.level === 2 ? 'text-2xl' : 'text-xl'}`}>
            {block.data.text}
          </HeaderTag>
        ); }
      case 'paragraph':
        return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
      case 'list':
        if (block.data.style === 'ordered') {
          return (
            <ol key={index} className="list-decimal pl-6 mb-4">
              {block.data.items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: typeof item === 'string' ? item : item.content }} />
              ))}
            </ol>
          );
        } else {
          return (
            <ul key={index} className="list-disc pl-6 mb-4">
              {block.data.items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: typeof item === 'string' ? item : item.content }} />
              ))}
            </ul>
          );
        }
      case 'code':
        return (
          <pre key={index} className="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
            <code>{block.data.code}</code>
          </pre>
        );
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-gray-300 pl-4 my-6 italic">
            <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
            {block.data.caption && (
              <footer className="text-sm text-gray-600 mt-2">
                — {block.data.caption}
              </footer>
            )}
          </blockquote>
        );
      case 'image':
        return (
          <figure key={index} className="mb-6">
            <img 
              src={block.data.file?.url || block.data.url} 
              alt={block.data.caption || 'Blog image'} 
              className="w-full rounded-lg"
            />
            {block.data.caption && (
              <figcaption className="text-center text-sm text-gray-500 mt-2">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );
      default:
        if (block.data && block.data.text) {
          return <p key={index} className="mb-4">{block.data.text}</p>;
        }
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/content" className="text-black hover:underline flex items-center">
            <FiArrowLeft className="mr-2" /> Back to Blog
          </Link>
          
          <div className="flex space-x-4">
            {isOwner && (
              <>
                <Link 
                  to={`/blog/edit/${blog.id}`} 
                  className="flex items-center text-sm text-gray-600 hover:text-black"
                >
                  <FiEdit className="mr-1" /> Edit
                </Link>
                <button 
                  onClick={handleDelete}
                  className="flex items-center text-sm text-red-600 hover:text-red-800"
                >
                  <FiTrash2 className="mr-1" /> Delete
                </button>
              </>
            )}
            <button 
              onClick={handleShare}
              className="flex items-center text-sm text-gray-600 hover:text-black relative"
            >
              <FiShare2 className="mr-1" /> Share
              {sharing && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-black text-white py-1 px-2 rounded whitespace-nowrap">
                  Copied to clipboard!
                </span>
              )}
            </button>
          </div>
        </div>
        
        <article className="bg-white rounded-lg overflow-hidden">
          {blog.image && (
            <div className="mb-6">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-64 sm:h-96 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
          )}
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{blog.title}</h1>
          
          <div className="flex flex-wrap items-center text-gray-600 mb-8">
            <div className="flex items-center mr-6 mb-2">
              <FiUser className="mr-1" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center mb-2">
              <FiCalendar className="mr-1" />
              <span>{blog.date}</span>
            </div>
            {blog.updatedAt && (
              <div className="w-full text-sm mt-1">
                (Updated: {blog.updatedAt})
              </div>
            )}
          </div>
          
          <div className="prose prose-lg max-w-none">
            {renderBlogContent()}
          </div>
        </article>
      </div>
    </div>
  );
};

export default ContentPost;