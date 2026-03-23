import React, { useState, useEffect } from 'react';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const BASE_URL = 'https://api.credenthealth.com/';

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.credenthealth.com/api/admin/getbanners');
        const data = await response.json();

        if (data.message === "Banner images fetched successfully") {
          setBanners(data.imageUrls);
        } else {
          setError('Failed to fetch banners');
        }
      } catch (err) {
        setError('Error fetching banners: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const handleImageError = (bannerId) => {
    setImageErrors(prev => ({
      ...prev,
      [bannerId]: true
    }));
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="h-32 md:h-44 bg-gray-200 rounded-xl mt-4 flex items-center justify-center">
          <div className="text-gray-600">Loading banners...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="h-32 md:h-44 bg-red-100 rounded-xl mt-4 flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="h-32 md:h-44 bg-gray-200 rounded-xl mt-4 flex items-center justify-center">
          <div className="text-gray-600">No banners available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Banner Container - Shadow removed */}
      <div className="relative h-32 sm:h-36 md:h-48 lg:h-56 xl:h-64 overflow-hidden rounded-xl mt-4">
        <div className="relative w-full h-full">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {!imageErrors[banner._id] ? (
                <img
                  src={`${BASE_URL}${banner.imageUrls[0]}`}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                  onError={() => handleImageError(banner._id)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-gray-500">Image not available</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dots - Banner ke bahar niche */}
      {banners.length > 1 && (
        <div className="flex justify-center space-x-2 mt-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-1 h-1 rounded-full transition-all ${
                index === currentBanner 
                  ? 'bg-blue-900 scale-110 shadow-md' 
                  : 'bg-gray-300 hover:bg-blue-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;