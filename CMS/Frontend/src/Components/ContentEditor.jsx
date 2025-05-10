import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Code from '@editorjs/code';
import Link from '@editorjs/link';
import Quote from '@editorjs/quote';
import Paragraph from '@editorjs/paragraph';
import axios from 'axios';
import Cookies from 'js-cookie';

const ContentEditor = ({ initialData, onSave }) => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState(initialData?.title || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  // eslint-disable-next-line no-unused-vars
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  // Debug initial values
  useEffect(() => {
    console.log('ContentEditor initialData:', initialData);
    
    // Set cover image preview from initialData if available
    if (initialData?.coverImage) {
      setCoverImagePreview(initialData.coverImage);
    }
  }, [initialData]);

  useEffect(() => {
    if (!editorRef.current) {
      // Parse initial editor data if available
      let initialEditorData;
      try {
        initialEditorData = initialData?.data ? JSON.parse(initialData.data) : null;
      } catch (e) {
        console.error('Error parsing initial editor data:', e);
        initialEditorData = null;
      }

      // If we couldn't parse the data or it wasn't provided, use default content
      if (!initialEditorData) {
        initialEditorData = {
          blocks: [
            {
              type: "paragraph",
              data: {
                text: "Start writing your blog post..."
              }
            }
          ]
        };
      }

      console.log('Initializing EditorJS with data:', initialEditorData);

      const editor = new EditorJS({
        holder: 'editorjs',
        tools: {
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          image: {
            class: Image,
            config: {
              endpoints: {
                byFile: `${API_URL}/api/image/addimage`,
              },
              uploader: {
                uploadByFile(file) {
                  const token = Cookies.get('token');
                  
                  const formData = new FormData();
                  formData.append('image', file);
                  
                  return axios.post(`${API_URL}/api/image/addimage`, 
                    formData, 
                    {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                      }
                    })
                    .then(response => {
                      return {
                        success: 1,
                        file: {
                          url: response.data
                        }
                      };
                    })
                    .catch(error => {
                      console.error('Image upload error:', error);
                      return {
                        success: 0,
                        file: {
                          url: ''
                        }
                      };
                    });
                }
              }
            }
          },
          code: Code,
          link: Link,
          quote: {
            class: Quote,
            inlineToolbar: true,
          }
        },
        data: initialEditorData,
        onReady: () => {
          console.log('EditorJS is ready');
          setIsEditorReady(true);
        },
        onChange: () => {
          console.log('EditorJS content changed');
        }
      });
      
      editorRef.current = editor;
    }
    
    return () => {
      if (editorRef.current && isEditorReady) {
        editorRef.current.isReady
          .then(() => {
            editorRef.current.destroy();
            editorRef.current = null;
          })
          .catch((e) => console.error('Error destroying editor:', e));
      }
    };
  }, [initialData, isEditorReady]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCoverImageFile(file);
    
    // Create a preview URL
    const imagePreviewUrl = URL.createObjectURL(file);
    setCoverImagePreview(imagePreviewUrl);
  };

  const handleSave = async () => {
    if (!editorRef.current || !isEditorReady) {
      console.error('Editor not ready');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a title for your post');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      console.log('Getting editor content...');
      const outputData = await editorRef.current.save();
      console.log('EditorJS output:', outputData);
      
      if (!outputData || !outputData.blocks || outputData.blocks.length === 0) {
        console.warn('Editor output may be empty:', outputData);
      }
      
      // We'll pass the content to the parent component instead of saving directly
      // This prevents duplicate save operations
      const postData = {
        title: title,
        excerpt: excerpt || '',
        data: JSON.stringify(outputData),
        id: initialData?.id, // Pass the ID if we're updating
        coverImage: coverImage || null, // Pass existing coverImage if available
      };
      
      console.log('Passing post data to parent component:', postData);
      
      // Call the parent's onSave handler with the data
      if (typeof onSave === 'function') {
        // Also pass the coverImageFile if we have one
        await onSave({...postData, image: coverImageFile});
      } else {
        console.error('No onSave handler provided');
      }
    } catch (error) {
      console.error('Error preparing post data:', error);
      setError('Failed to prepare post data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-grow">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0"
          />
        </div>
        
        <div className="md:w-1/3">
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Cover Image
            </label>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
              id="cover-image-input"
            />
            
            <label 
              htmlFor="cover-image-input" 
              className="cursor-pointer"
            >
              {coverImagePreview ? (
                <div className="relative w-full h-40 mb-2">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    className="w-full h-full object-cover rounded-md" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                    <span className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-md">
                      Change Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center mb-2">
                  <div className="text-center">
                    <svg 
                      className="mx-auto h-12 w-12 text-gray-400" 
                      stroke="currentColor" 
                      fill="none" 
                      viewBox="0 0 48 48" 
                      aria-hidden="true"
                    >
                      <path 
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                        strokeWidth={2} 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                    <p className="mt-1 text-sm text-gray-500">
                      Add cover image
                    </p>
                  </div>
                </div>
              )}
            </label>
            
            <p className="text-xs text-gray-500">
              Recommended: 1200×630px or larger
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Enter a brief excerpt (optional)"
          className="w-full text-gray-600 border-none focus:outline-none focus:ring-0 resize-none"
          rows={2}
        />
      </div>
      
      <div id="editorjs" className="prose max-w-none min-h-[300px]" />
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving || !isEditorReady}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : initialData?.id ? 'Update Post' : 'Save Post'}
        </button>
      </div>
    </div>
  );
};

export default ContentEditor;