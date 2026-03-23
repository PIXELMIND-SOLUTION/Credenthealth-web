import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';  // Adjust path if necessary

const LabCategoryPage = () => {
  const navigate = useNavigate();

  const cardData = [
    { name: "Lab Tests", image: "/images/labtest.png", path: "/labtest" },
    { name: "Packages", image: "/images/package.png", path: "/packages" },
    { name: "Scans & X-Rays", image: "/images/xray.png", path: "/scan&xrays" }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Lab Test & Packages
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {cardData.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                onClick={() => navigate(item.path)}
              >
                <div className="flex justify-center items-center mb-4">
                  {/* Circle background for image */}
                  <div className="bg-blue-500 rounded-full w-20 h-20 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
                  {item.name}
                </h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabCategoryPage;