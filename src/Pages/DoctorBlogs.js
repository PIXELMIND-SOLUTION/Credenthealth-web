import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const DoctorBlogsPage = () => {
  const [blogs, setBlogs] = useState([]); // Store the fetched blogs
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedBlog, setSelectedBlog] = useState(null); // Store the selected blog for popup

  // Fetch the blogs when the component mounts
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('https://api.elthiumhealth.com/api/doctor/blogs');
        if (response.data.blogs) {
          setBlogs(response.data.blogs); // Set the blogs state with the fetched data
        } else {
          setBlogs([]);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(<span style={{ color: 'black' }}>No Wellness Reads Available.</span>);
      } finally {
        setLoading(false); // Set loading to false after API call
      }
    };

    fetchBlogs(); // Call the fetch function when component mounts
  }, []);

  // Handle opening the modal with the selected blog
  const openModal = (blog) => {
    setSelectedBlog(blog);
  };

  // Handle closing the modal
  const closeModal = () => {
    setSelectedBlog(null);
  };

  return (
    <div className="bg-gray-50">
            <Navbar />
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-left text-gray-800 mb-4 mt-8">
          Wellness Reads
        </h1>

        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading blogs...</p>
        ) : error ? (
          <p className="text-center text-lg text-red-500">{error}</p>
        ) : (
          <div>
            {/* No blogs available message */}
            {blogs.length === 0 ? (
              <div className="flex justify-center items-center">
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/023/629/113/small_2x/animated-smiling-male-doctor-asian-man-physician-holding-clipboard-isolated-2d-animation-cartoon-flat-line-character-4k-footage-white-background-alpha-channel-transparency-for-web-design-video.jpg"
                  alt="Smiling Doctor Animation"
                  className="w-1/2 h-auto"
                />
              </div>
            ) : (
              blogs.map((blog) => (
                <div key={blog._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">{blog.title}</h2>
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Published by:</span> Dr. {blog.doctor.name} |{' '}
                    <span className="font-medium">Published on:</span>{' '}
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 mb-2">{blog.content.substring(0, 100)}...</p>
                  <button
                    onClick={() => openModal(blog)} // Open modal when "Read more" is clicked
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Read more...
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal for displaying full blog details */}
        {selectedBlog && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">{selectedBlog.title}</h2>
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium">Published by:</span> Dr. {selectedBlog.doctor.name} |{' '}
                <span className="font-medium">Published on:</span>{' '}
                {new Date(selectedBlog.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mb-4">{selectedBlog.content}</p>
              <button
                onClick={closeModal} // Close modal when the user clicks the close button
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorBlogsPage;
