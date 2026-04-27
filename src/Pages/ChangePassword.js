import React, { useState } from "react";
import axios from "axios";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // Make sure to import your Navbar component

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const navigate = useNavigate();
  const staffId = localStorage.getItem("staffId");

  const handleInputChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
    // Clear messages when user starts typing
    if (error || success) {
      setError("");
      setSuccess("");
    }
  };

  const validateForm = () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      setError("Both fields are required");
      return false;
    }

    if (passwords.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return false;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      setError("New password must be different from current password");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    if (!staffId) {
      setError("Staff ID not found. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `https://api.credenthealth.com/api/staff/changepassword/${staffId}`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }
      );

      if (response.data.message) {
        setSuccess("Password changed successfully!");
        setPasswords({
          currentPassword: "",
          newPassword: ""
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Helmet>
        <title>Change Password | Elthium Health</title>
        <meta name="description" content="Change your password for Elthium Health account" />
        <meta name="keywords" content="change password, security, Elthium Health" />
      </Helmet>

      {/* Navbar */}
      <Navbar />

      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="flex-1 overflow-y-auto">
          {/* Header with Back Arrow */}
          <div className="relative flex items-center border-b bg-white p-4">
            <button
              onClick={() => navigate(-1)}
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
              Change Password
            </h1>
          </div>

          {/* Main Content */}
          <div className="flex-grow px-4 py-6">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
              {/* Header Icon */}
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FaLock className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
                <p className="text-gray-600 mt-2">Update your account password</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}

              {/* Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwords.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loading ? "Changing Password..." : "Change Password"}
                </button>
              </form>

              {/* Security Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Password Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use at least 6 characters</li>
                  <li>• Don't reuse old passwords</li>
                  <li>• Avoid common words or patterns</li>
                  <li>• Use a combination of letters and numbers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;