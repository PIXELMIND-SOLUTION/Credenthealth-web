import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaWallet,
  FaQuestionCircle,
  FaUsers,
  FaCog,
  FaMapMarkerAlt,
  FaUserShield,
  FaTrash,
  FaFileAlt,
  FaBell,
  FaEdit,
  FaCamera,
  FaUser,
  FaKey // Added FaKey icon for change password
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const ProfilePage = () => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();

  const staffId = localStorage.getItem("staffId");

  const menuItems = [
    { icon: <FaUser className="text-blue-600" />, label: "My Profile", path: "/myprofile" },
    { icon: <FaKey className="text-green-600" />, label: "Change Password", path: "/changepassword" }, // Added Change Password
    { icon: <FaWallet className="text-blue-500" />, label: "Wallet", path: "/wallet" },
    { icon: <FaQuestionCircle className="text-purple-500" />, label: "Customer Support", path: "/help" },
    { icon: <FaUsers className="text-green-500" />, label: "Family Members", path: "/family" },
    { icon: <FaFileAlt className="text-orange-500" />, label: "Wellness Read", path: "/doctorblogs" },
    { icon: <FaMapMarkerAlt className="text-blue-400" />, label: "Address", path: "/address" },
    { icon: <FaUserShield className="text-green-400" />, label: "Privacy Policy", path: "https://credenthealth-policies.onrender.com/privacy-and-policy" },
    { icon: <FaTrash className="text-red-500" />, label: "Delete Account", path: "/delete-account" },
    { icon: <FaFileAlt className="text-blue-600" />, label: "Terms & Conditions", path: "https://credenthealth-policies.onrender.com/terms-and-conditions" },
    { icon: <FaBell className="text-purple-500" />, label: "Notifications", path: "/notification" },
  ];

  useEffect(() => {
    fetchStaffProfile();
  }, [staffId]);

  const fetchStaffProfile = () => {
    if (staffId) {
      axios
        .get(`https://api.credenthealth.com/api/staff/getprofile/${staffId}`)
        .then((res) => {
          console.log("Profile API Response:", res.data); // Debugging ke liye
          setStaff(res.data.staff);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Profile fetch error:", err);
          setError("Failed to fetch profile");
          setLoading(false);
        });
    } else {
      setError("No staffId found");
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleUpdateProfile = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      const response = await axios.put(
        `https://api.credenthealth.com/api/staff/updateProfileImage/${staffId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        console.log("Update API Response:", response.data); // Debugging ke liye
        setStaff(response.data.staff);
        setShowEditModal(false);
        setSelectedFile(null);
        setPreviewUrl("");
        // Refresh the profile data
        fetchStaffProfile();
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      setError("Failed to update profile image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedFile(null);
    setPreviewUrl("");
    setError("");
  };

  // Function to get profile image URL
  const getProfileImageUrl = () => {
    if (!staff || !staff.profileImage) {
      return "http://localhost:3000/logo.png";
    }
    
    // Agar profileImage already full URL hai toh wahi use karo
    if (staff.profileImage.startsWith('http')) {
      return staff.profileImage;
    }
    
    // Agar relative path hai toh base URL add karo
    return `https://api.credenthealth.com${staff.profileImage}`;
  };

  return (
    <div className="flex flex-col h-screen pb-20">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="relative flex items-center border-b p-4">
            <button
              onClick={() => window.history.back()}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>

            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-gray-800">
              Menu
            </h1>
          </div>

          {/* User Info with Edit Icon */}
          <div className="p-6 border-b flex items-center space-x-4 relative">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : staff ? (
              <>
                <div className="relative">
                  <img
                    src={getProfileImageUrl()}
                    alt="Profile"
                    className="w-14 h-14 rounded-full object-cover border"
                    onError={(e) => {
                      console.error("Image load error:", e);
                      e.target.src = "http://localhost:3000/logo.png";
                    }}
                  />
                  <button
                    onClick={handleEditClick}
                    className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <FaCamera size={12} />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">{staff.name}</h2>
                    <button
                      onClick={handleEditClick}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaEdit size={16} />
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">{staff.email}</p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No staff data found</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-3">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  if (item.path.startsWith("http")) {
                    window.open(item.path, "_blank");
                  } else {
                    navigate(item.path);
                  }
                }}
                className="flex items-center p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg mr-3">
                  {item.icon}
                </div>
                <p className="text-gray-800 font-medium">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={() => {
                localStorage.removeItem("staffId");
                navigate("/");
              }}
              className="w-full border border-red-500 text-red-500 py-3 rounded-lg font-semibold hover:bg-red-50 mb-12 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && staff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Update Profile Picture</h2>
            </div>
            
            <div className="p-4">
              {/* Image Preview */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img
                    src={previewUrl || getProfileImageUrl()}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      console.error("Modal image load error:", e);
                      e.target.src = "http://localhost:3000/logo.png";
                    }}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* File Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose New Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={!selectedFile || uploading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? "Uploading..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;