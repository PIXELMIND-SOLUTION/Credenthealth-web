import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5"; // back arrow icon
import axios from "axios";
import Navbar from "./Navbar";

const HraPage = () => {
  const [showMessage, setShowMessage] = useState(true);
  const [hraData, setHraData] = useState([]);
  const [filteredHraData, setFilteredHraData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendMessage, setBackendMessage] = useState("");

  const BASE_URL = "https://api.elthiumhealth.com";
  const staffId = localStorage.getItem("staffId");
  const gender = localStorage.getItem("gender"); // Get gender from localStorage
  const navigate = useNavigate();

  useEffect(() => {
    if (staffId) {
      setLoading(true);
      axios
        .get(`${BASE_URL}/api/staff/allhracat/${staffId}`)
        .then((response) => {
          if (response.data.message) {
            setBackendMessage(response.data.message);
          }
          if (response.data.hras && response.data.hras.length > 0) {
            setHraData(response.data.hras);
            
            // Filter categories based on gender directly
            const filteredData = response.data.hras.filter(item => {
              // If gender is Male, exclude all female-related categories
              if (gender === "Male") {
                // Exclude categories with gender-specific keyword (e.g., "female", "women", etc.)
                return item.gender !== "Female"; // Exclude Female categories for males
              }

              // For females or other genders, show all categories
              return true;
            });

            setFilteredHraData(filteredData);
          } else {
            setHraData([]);
            setFilteredHraData([]);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Error fetching HRA data");
          setLoading(false);
        });
    } else {
      setError("Staff ID not found.");
      setLoading(false);
    }
  }, [staffId, gender]);

  const handleStart = () => {
    setShowMessage(false);
  };

  const handleBack = () => {
    if (!showMessage) {
      setShowMessage(true); // go back to intro page
    } else {
      navigate(-1); // go back in history
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/hra-questions?category=${categoryName}`);
  };

  const getImageUrl = (image) => {
    // If image is null, undefined, or empty
    if (!image) {
      return "https://cdn.dribbble.com/users/2001042/screenshots/4951997/developmentanimation.gif"; // default placeholder image
    }

    // If already a valid external URL
    if (image.startsWith("http")) {
      return image;
    }

    // If multer-style upload path
    return `${BASE_URL.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
  };

  return (
    <div className="bg-white min-h-screen flex flex-col pb-20">
      {/* Navbar */}
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        {/* Content Wrapper with padding-top */}
        <div className="flex-1 pt-16 px-5 py-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center mb-4">
            <IoArrowBack
              size={24}
              className="cursor-pointer"
              onClick={handleBack}
            />
            <h1 className="flex-1 text-center text-lg font-semibold">Heath Risk Assessment</h1>
            <div className="w-6" /> {/* spacer to balance layout */}
          </div>

          {showMessage ? (
            <div className="max-w-md mx-auto">
              {/* Title */}
              <h2 className="text-3xl font-bold mb-4">
                Know Your <span className="text-blue-600">Health</span> Risk
              </h2>

              {/* What's This */}
              <h3 className="text-lg font-semibold mb-1">What's This?</h3>
              <p className="text-gray-700 mb-4">
                A quick, evidence-based questionnaire that spots potential health
                risks and gives you an instant overview of your current health risk.
                <br />
                <br />
                These questions guide you to wellness, not fear.
              </p>

              {/* Why Take It */}
              <h3 className="text-lg font-semibold mb-1">Why Take It?</h3>
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                <li>Insight in 5 minutes - snapshot of your current health risk.</li>
                <li>Preventive focus - catch early warning signs before they develop.</li>
                <li>Actionable tips - simple next steps you can start today.</li>
              </ul>

              {/* Note */}
              <p className="text-sm text-gray-600 mb-6">
                <span className="font-semibold">Disclaimer:</span> This is not a medical
                diagnosis and is for education purposes only and does not constitute a medical advice.
                If you have any heath concerns, please consult a qualified healthcare professional.
              </p>

              {/* Start Button */}
              <button
                onClick={handleStart}
                className="w-full py-3 bg-blue-100 text-blue-600 font-semibold rounded-md mb-10"
              >
                Let&apos;s Start
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>{error}</p>
              ) : filteredHraData.length > 0 ? (
                filteredHraData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 border rounded-md cursor-pointer"
                    onClick={() => handleCategoryClick(item.hraName)}
                  >
                    <img
                      src={getImageUrl(item.hraImage)}
                      alt={item.hraName}
                      className="w-12 h-12 object-cover rounded mr-3"
                    />

                    <p className="text-base font-semibold">{item.hraName}</p>
                  </div>
                ))
              ) : (
                <p>No health risk data available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HraPage;
