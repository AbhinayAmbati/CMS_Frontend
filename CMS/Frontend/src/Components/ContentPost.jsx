import React from 'react';
import { useParams, Link } from 'react-router-dom';
import blogs from '../constants/blogs.json';

const ContentPost = () => {
  const { id } = useParams();
  const blog = blogs.find(blog => blog.id === parseInt(id));

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
        <Link to="/blog" className="text-blue-600 hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  const renderContent = (block) => {
    switch (block.type) {
      case 'paragraph':
        return <p className="mb-4">{block.data.text}</p>;
      case 'list':
        return (
          <ul className="list-disc pl-6 mb-4">
            {block.data.items.map((item, index) => (
              <li key={index}>{item.content}</li>
            ))}
          </ul>
        );
      case 'code':
        return (
          <pre className="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
            <code>{block.data.code}</code>
          </pre>
        );
      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic">
            <p>{block.data.text}</p>
            {block.data.caption && (
              <footer className="text-sm text-gray-600 mt-2">
                — {block.data.caption}
              </footer>
            )}
          </blockquote>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Blog
      </Link>
      <article className="max-w-3xl mx-auto">
        <img 
          src={blog.image} 
          alt={blog.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
        <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
        <div className="flex items-center text-gray-600 mb-8">
          <span className="mr-4">By {blog.author}</span>
          <span>{blog.date}</span>
        </div>
        <div className="prose max-w-none">
          {blog.data.content.blocks.map((block) => (
            <div key={block.id}>
              {renderContent(block)}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
};

export default ContentPost; 