import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaArrowLeft, FaStethoscope } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";

const DoctorCategoryPage = () => {
  const { category, type } = useParams();
  const [doctorCategoryData, setDoctorCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [specialCategoryData, setSpecialCategoryData] = useState([]);
  const [selectedSpecialCategories, setSelectedSpecialCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Background color options for categories
  const bgColors = [
    "bg-gradient-to-br from-blue-50 to-blue-100",
    "bg-gradient-to-br from-green-50 to-green-100",
    "bg-gradient-to-br from-purple-50 to-purple-100",
    "bg-gradient-to-br from-pink-50 to-pink-100",
    "bg-gradient-to-br from-indigo-50 to-indigo-100",
    "bg-gradient-to-br from-teal-50 to-teal-100",
    "bg-gradient-to-br from-orange-50 to-orange-100",
    "bg-gradient-to-br from-cyan-50 to-cyan-100",
  ];

  const borderColors = [
    "border-blue-200",
    "border-green-200",
    "border-purple-200",
    "border-pink-200",
    "border-indigo-200",
    "border-teal-200",
    "border-orange-200",
    "border-cyan-200",
  ];

  // Fetch doctor category data
  useEffect(() => {
    axios
      .get("https://api.elthiumhealth.com/api/admin/getallcategory")
      .then((response) => {
        setDoctorCategoryData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching doctor categories:", error);
        setLoading(false);
      });
  }, [category, type]);

  // Fetch special category data
  useEffect(() => {
    axios
      .get("https://api.elthiumhealth.com/api/admin/getspecialcategory")
      .then((response) => {
        setSpecialCategoryData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching special categories:", error);
      });
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term) {
      setFilteredData(doctorCategoryData);
    } else {
      const filtered = doctorCategoryData.filter((item) =>
        item.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const handleSpecialCategoryChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedSpecialCategories((prev) =>
      prev.includes(selectedValue)
        ? prev.filter((item) => item !== selectedValue)
        : [...prev, selectedValue]
    );
  };

  const handleBack = () => {
    navigate("/home");
  };

  const handleSubmit = () => {
    if (selectedSpecialCategories.length === 0) {
      alert("Please select at least one special category.");
    } else {
      const selectedCategoriesString = selectedSpecialCategories.join(",");
      navigate(`/doctor-list/${selectedCategoriesString}`, {
        state: { 
          consultationType: type,
          fromCategoryPage: true 
        }
      });
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/doctor-list/${categoryName}`, {
      state: { 
        consultationType: type,
        fromCategoryPage: true 
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex justify-center items-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <main className="py-6 px-4 sm:px-6 lg:px-8 flex-1">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold mb-4">
              <FaStethoscope className="text-blue-600" />
              Consultation Type: {type || "Not Specified"}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Book {type === 'Offline' ? 'Clinic Visit' : 'Virtual Consultation'}
            </h1>
            <p className="text-gray-600">Choose your specialty and find the right doctor</p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search doctor categories..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Medical Specialties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredData.map((item, index) => {
                const bgColor = bgColors[index % bgColors.length];
                const borderColor = borderColors[index % borderColors.length];
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-xl shadow-sm border ${borderColor} overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer group`}
                    onClick={() => handleCategoryClick(item.name)}
                  >
                    <div className={`${bgColor} p-6 flex justify-center items-center h-32`}>
                      <img
                        src={`https://api.elthiumhealth.com${item.image}`}
                        alt={item.name}
                        className="w-16 h-16 object-contain group-hover:scale-110 transition duration-300"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=MD";
                        }}
                      />
                    </div>
                    <div className="p-4 text-center">
                      {/* Category Name with Blue Underline */}
                      <h2 className="text-lg font-semibold text-gray-800 mb-1 relative inline-block pb-1">
                        {item.name}
                        <span 
                          className="absolute left-0 bottom-0 w-full h-1 bg-blue-500 rounded"
                          style={{
                            animation: "underline 0.3s ease-in-out",
                            marginTop: "4px"
                          }}
                        ></span>
                      </h2>
                      <p className="text-sm text-gray-600 mt-2">{type} Consultation</p>
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        View Doctors →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Categories Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Didn't Find Your Issue?
              </h2>
              <p className="text-gray-600">Please be more specific about your health concern</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {specialCategoryData.map((specialCategory, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                  <input
                    type="checkbox"
                    value={specialCategory.name}
                    onChange={handleSpecialCategoryChange}
                    className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-gray-800 font-medium cursor-pointer">
                    {specialCategory.name}
                  </label>
                </div>
              ))}
            </div>

            {selectedSpecialCategories.length > 0 && (
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-md"
                >
                  Find Doctors for {selectedSpecialCategories.length} Specialties ({type})
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedSpecialCategories.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-300"
            >
              <FaArrowLeft />
              Back to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>

      {/* CSS for underline animation */}
      <style>
        {`
          @keyframes underline {
            0% { transform: scaleX(0); }
            100% { transform: scaleX(1); }
          }
        `}
      </style>
    </div>
  );
};

export default DoctorCategoryPage;