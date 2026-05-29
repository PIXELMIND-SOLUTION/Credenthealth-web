import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import { CalendarDays, ArrowRight, X } from 'lucide-react';

const DoctorBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(
          'https://api.elthiumhealth.com/api/doctor/blogs'
        );

        if (response.data.blogs) {
          setBlogs(response.data.blogs);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const openModal = (blog) => {
    setSelectedBlog(blog);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedBlog(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#2563eb] py-16 sm:py-20">
        
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-cyan-200 text-sm font-medium mb-6">
              Wellness & Medical Insights
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              Wellness Reads
            </h1>

            <p className="mt-6 text-lg text-slate-200 leading-relaxed max-w-2xl">
              Discover trusted healthcare insights, wellness tips,
              medical guidance and expert articles curated for a
              healthier lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* LOADING */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

              <p className="mt-6 text-slate-500 text-lg">
                Loading wellness reads...
              </p>
            </div>
          ) : blogs.length === 0 ? (

            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-20">
              <img
                src="https://static.vecteezy.com/system/resources/thumbnails/023/629/113/small_2x/animated-smiling-male-doctor-asian-man-physician-holding-clipboard-isolated-2d-animation-cartoon-flat-line-character-4k-footage-white-background-alpha-channel-transparency-for-web-design-video.jpg"
                alt="No blogs available"
                className="w-full max-w-md object-contain"
              />

              <h2 className="mt-6 text-2xl font-bold text-slate-800">
                No Wellness Reads Available
              </h2>

              <p className="mt-3 text-slate-500 text-center max-w-md">
                Fresh medical insights and wellness articles will
                appear here soon.
              </p>
            </div>

          ) : (

            /* BLOG GRID */
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="
                    group bg-white rounded-3xl overflow-hidden
                    border border-slate-200
                    shadow-sm hover:shadow-2xl
                    transition-all duration-500
                    hover:-translate-y-2
                  "
                >

                  {/* IMAGE */}
                  <div className="relative overflow-hidden h-60">
                    <img
                      src={`https://api.elthiumhealth.com${blog.image}`}
                      alt={blog.title}
                      className="
                        w-full h-full object-cover
                        group-hover:scale-110
                        transition-transform duration-700
                      "
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6">

                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <CalendarDays size={16} className="text-blue-600" />

                      <span>
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 leading-snug line-clamp-2">
                      {blog.title}
                    </h2>

                    <p className="mt-4 text-slate-600 leading-relaxed line-clamp-3">
                      {blog.description}
                    </p>

                    <button
                      onClick={() => openModal(blog)}
                      className="
                        mt-6 inline-flex items-center gap-2
                        text-blue-600 font-semibold
                        hover:text-blue-700
                        transition-all
                        group/button
                      "
                    >
                      View More

                      <ArrowRight
                        size={18}
                        className="group-hover/button:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {selectedBlog && (
        <div className="fixed inset-0 z-[9999]">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          {/* MODAL CONTENT */}
          <div className="relative h-full overflow-y-auto py-10 px-4">
            <div
              className="
                max-w-4xl mx-auto bg-white rounded-[32px]
                overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.35)]
                animate-[fadeIn_.3s_ease]
              "
            >

              {/* IMAGE */}
              <div className="relative h-[280px] sm:h-[420px] overflow-hidden">
                <img
                  src={`https://api.elthiumhealth.com${selectedBlog.image}`}
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                {/* CLOSE */}
                <button
                  onClick={closeModal}
                  className="
                    absolute top-5 right-5
                    w-11 h-11 rounded-full
                    bg-white/90 backdrop-blur-md
                    flex items-center justify-center
                    hover:bg-red-500 hover:text-white
                    transition-all duration-300
                  "
                >
                  <X size={20} />
                </button>

                {/* TITLE */}
                <div className="absolute bottom-0 left-0 p-6 sm:p-10">
                  <div className="flex items-center gap-2 text-sm text-blue-100 mb-4">
                    <CalendarDays size={16} />

                    <span>
                      {new Date(
                        selectedBlog.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight max-w-3xl">
                    {selectedBlog.title}
                  </h2>
                </div>
              </div>

              {/* BODY */}
              <div className="p-6 sm:p-10">
                <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
                  {selectedBlog.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DoctorBlogsPage;