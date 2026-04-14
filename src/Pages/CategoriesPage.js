import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  { name: "Doctor Consultation", image: "/category/doc.png" },
  { name: "Lab Test & Packages", image: "/category/lab.png" },
  { name: "Health Risk Assessment", image: "/category/hra.png" }   // Changed from "HRA"
];

const CategoriesPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    if (categoryName === "Doctor Consultation") {
      setSelectedCategory(categoryName);
      setShowPopup(true);
    } else if (categoryName === "Lab Test & Packages") {
      navigate("/lab-category");
    } else if (categoryName === "Health Risk Assessment") {   // Updated condition
      navigate("/hra-category");
    } else if (
      categoryName === "Eye Care" ||
      categoryName === "Dental Care" ||
      categoryName === "Medicines"
    ) {
      setShowComingSoon(true);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setShowComingSoon(false);
  };

  const handleNavigateToDoctorCategory = (type) => {
    const consultationType = type === "visit-clinic" ? "Offline" : "Online";
    navigate(`/doctor-category/${selectedCategory}/${type}`, {
      state: { consultationType },
    });
    setShowPopup(false);
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      {/* Categories Grid - Responsive */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex flex-col items-center cursor-pointer p-4 sm:p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:bg-white/40"
            onClick={() => handleCategoryClick(category.name)}
          >
            {/* Image Container */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/50 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-inner border border-white/60">
              <img
                src={category.image}
                alt={category.name}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
            </div>
            
            {/* Category Name - now shows full form for HRA */}
            <p className="text-base font-bold text-gray-800 text-center sm:text-lg">
              {category.name}
            </p>
          </div>
        ))}
      </div>

      {/* Doctor Consultation Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50"
          onClick={handlePopupClose}
        >
          <div
            className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-11/12 sm:w-80 mx-4 border border-white/40"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              Choose Consultation Type
            </h3>

            <div className="space-y-3">
              {/* Visit Clinic */}
              <div
                onClick={() => handleNavigateToDoctorCategory("Offline")}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-300 bg-white/50"
              >
                <div className="flex items-center">
                  <img
                    src="/images/clinic.png"
                    alt="Visit Clinic"
                    className="w-10 h-10 mr-3"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">Visit Clinic</h4>
                    <p className="text-xs text-gray-600">
                      Meet the doctor in person at the clinic.
                    </p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-500"></i>
              </div>

              {/* Virtual Consultation */}
              <div
                onClick={() => handleNavigateToDoctorCategory("Online")}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-green-50/50 hover:border-green-300 transition-all duration-300 bg-white/50"
              >
                <div className="flex items-center">
                  <img
                    src="/images/virtual.png"
                    alt="Virtual Consultation"
                    className="w-10 h-10 mr-3"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Virtual Consultation
                    </h4>
                    <p className="text-xs text-gray-600">
                      Consult online from your home.
                    </p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-500"></i>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={handlePopupClose}
                className="text-blue-500 font-semibold hover:underline px-4 py-2 rounded-lg hover:bg-blue-50/50 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Popup */}
      {showComingSoon && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handlePopupClose}
        >
          <div
            className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-11/12 sm:w-80 mx-4 flex flex-col items-center border border-white/40"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="https://i.gifer.com/TweA.gif"
              alt="Coming Soon"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-4"
            />
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Coming Soon
            </h3>
            <p className="text-sm text-gray-600 text-center">
              This feature will be available soon. Stay tuned!
            </p>
            <button
              onClick={handlePopupClose}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;