import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [needsTermsAcceptance, setNeedsTermsAcceptance] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    
    // Check localStorage for terms acceptance
    const checkTermsAcceptance = () => {
      const acceptedTerms = localStorage.getItem("acceptedTerms");
      if (acceptedTerms === "true") {
        setNeedsTermsAcceptance(false);
      }
    };
    
    checkTermsAcceptance();
    
    return () => clearTimeout(timer);
  }, []);

  // Terms and Conditions link click handler
  const handleTermsClick = (e) => {
    e.preventDefault();
    // Open terms page in new tab
    window.open("https://healthcare-terms-policies.onrender.com/terms-and-conditions", "_blank");
  };

  // Privacy Policy link click handler
  const handlePrivacyClick = (e) => {
    e.preventDefault();
    // Open privacy policy page in new tab
    window.open("https://healthcare-terms-policies.onrender.com/privacy-and-policy", "_blank");
  };

  // Login handler - Updated for email OR phone number
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTermsError("");

    if (!emailOrPhone || !password) {
      setError("Please fill in both fields.");
      return;
    }

    if (needsTermsAcceptance && !acceptTerms) {
      setTermsError("You must accept the terms and conditions to continue.");
      return;
    }

    try {
      // Check if input is email or phone number
      const isEmail = emailOrPhone.includes('@');
      
      const loginData = {
        password,
        acceptTermsAndConditions: needsTermsAcceptance ? acceptTerms : false
      };

      // Set either email or contact_number based on input type
      if (isEmail) {
        loginData.email = emailOrPhone;
      } else {
        loginData.contact_number = emailOrPhone;
      }

      const response = await axios.post(
        "https://api.credenthealth.com/api/staff/login-staff",
        loginData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        const { staff, companyInfo } = response.data;
        
        // Terms and conditions handling
        if (staff.termsAndConditionsAccepted) {
          setNeedsTermsAcceptance(false);
          localStorage.setItem("acceptedTerms", "true");
        }

        // Store basic staff info
        localStorage.setItem("staffId", staff._id);
        localStorage.setItem("name", staff.name);
        localStorage.setItem("gender", staff.gender);
        if (staff.contact_number) {
          localStorage.setItem("contact_number", staff.contact_number);
        }
        
        // Store companyId (from staff object or companyInfo)
        const companyIdToStore = staff.companyId || (companyInfo && companyInfo.companyId);
        if (companyIdToStore) {
          localStorage.setItem("companyId", companyIdToStore);
        }
        
        // Store companyName if available
        if (companyInfo && companyInfo.companyName) {
          localStorage.setItem("companyName", companyInfo.companyName);
        }
        
        // Store full objects
        sessionStorage.setItem("staff", JSON.stringify(staff));
        if (companyInfo) {
          sessionStorage.setItem("companyInfo", JSON.stringify(companyInfo));
        }

        navigate("/home");
      }
    } catch (err) {
      if (err.response?.data?.message?.includes('Terms and conditions')) {
        setTermsError(err.response.data.message);
        setNeedsTermsAcceptance(true);
      } else {
        setError("Invalid email/phone or password.");
      }
    }
  };

  // Forgot password handler - UNCHANGED
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail || !newPassword) {
      setForgotError("Please fill in both fields.");
      return;
    }

    try {
      const response = await axios.post(
        "https://api.credenthealth.com/api/staff/forgot-password",
        { email: forgotEmail, newPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setForgotSuccess("Password updated successfully! You can now login.");
        setForgotEmail("");
        setNewPassword("");

        setTimeout(() => {
          setShowForgotModal(false);
          setForgotSuccess("");
        }, 1500);
      }
    } catch (err) {
      console.log(err.response);
      setForgotError(
        err.response?.data?.message || err.response?.data?.error || "Failed to reset password."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <img src="/logo.png" alt="App Logo" className="w-24 h-24 animate-bounce mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Credent Health</h1>
        <p className="mt-2 text-gray-500 animate-pulse">One Platform, Total Wellness</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col md:flex-row shadow-lg rounded-2xl w-full max-w-4xl bg-white overflow-hidden">
        <div className="hidden md:block md:w-1/2">
          <img src="/logo.png" alt="Login Illustration" className="h-full w-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-6 md:hidden object-contain" />
          <div className="w-full max-w-md">
            <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6">Login</h1>

            {error && (
              <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-center">{error}</div>
            )}
            {forgotSuccess && (
              <div className="bg-green-100 text-green-700 p-2 mb-4 rounded text-center">
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="emailOrPhone" className="block mb-1 font-medium">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  id="emailOrPhone"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter your email or phone number"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block mb-1 font-medium">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              {/* Show terms checkbox only if needed */}
              {needsTermsAcceptance && (
                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (e.target.checked) {
                        setTermsError(""); // Clear error when user checks
                      }
                    }}
                    className="mt-1 mr-3 h-5 w-5 text-blue-600 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                      I agree to the{" "}
                      <a 
                        href="https://healthcare-terms-policies.onrender.com/terms-and-conditions"
                        onClick={handleTermsClick}
                        className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms and Conditions
                      </a>
                      {" and "}
                      <a 
                        href="https://healthcare-terms-policies.onrender.com/privacy-and-policy"
                        onClick={handlePrivacyClick}
                        className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </a>
                    </label>
                    {termsError && (
                      <div className="mt-1 text-red-600 text-sm">{termsError}</div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2 rounded transition ${
                  needsTermsAcceptance && !acceptTerms
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
                disabled={needsTermsAcceptance && !acceptTerms}
              >
                Login
              </button>
            </form>

            <p className="text-sm text-right mt-2">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot Password?
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal - UNCHANGED */}
      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reset Password</h2>

            {forgotError && (
              <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-center">{forgotError}</div>
            )}
            {forgotSuccess && (
              <div className="bg-green-100 text-green-700 p-2 mb-4 rounded text-center">{forgotSuccess}</div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label className="block mb-1 font-medium">New Password</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  className="text-gray-600 hover:underline"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;