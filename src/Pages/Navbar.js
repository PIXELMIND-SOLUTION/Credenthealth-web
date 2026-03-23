import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoHomeOutline,
  IoPersonOutline,
  IoWalletOutline,
  IoCartOutline,
  IoMenuOutline,
  IoAddOutline,
  IoChevronDownOutline,
  IoDocumentTextOutline,
  IoCloudUploadOutline,
} from "react-icons/io5";
import { CiChat1 } from "react-icons/ci";
import axios from "axios";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [walletBalance, setWalletBalance] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMedicalDropdownOpen, setIsMedicalDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const staffId = localStorage.getItem("staffId");

  // ✅ Fetch Wallet Balance
  useEffect(() => {
    if (staffId) {
      axios
        .get(`https://api.credenthealth.com/api/staff/wallet/${staffId}`)
        .then((response) => {
          setWalletBalance(response.data.wallet_balance);
        })
        .catch((error) => {
          console.error("Error fetching wallet data:", error);
        });
    }
  }, [staffId]);

  // ✅ Fetch Cart Count
  useEffect(() => {
    if (staffId) {
      axios
        .get(`https://api.credenthealth.com/api/staff/mycart/${staffId}`)
        .then((response) => {
          if (response.data && response.data.items) {
            setCartCount(response.data.items.length);
          }
        })
        .catch((error) => {
          console.error("Error fetching cart data:", error);
        });
    }
  }, [staffId]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.medical-dropdown')) {
        setIsMedicalDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ✅ Reusable Icon Wrapper
  const IconWrapper = ({ children }) => (
    <div className="bg-white shadow-md rounded-full p-2 flex items-center justify-center relative">
      {children}
    </div>
  );

  const [showText, setShowText] = useState(true);

  useEffect(() => {
    const checkWidth = () => setShowText(window.innerWidth >= 375);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <>
      {/* ✅ Top Navbar */}
      <header className="bg-white py-3 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/home" className="flex items-center gap-2 no-underline">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
              {showText && (
                <h3 className="font-bold text-xl text-gray-900">Credent Health</h3>
              )}
            </Link>
          </div>

          {/* ✅ Right side */}
          <div className="flex items-center gap-6">
            {/* Desktop Nav */}
            <div className="hidden lg:flex gap-6 text-gray-700 text-sm font-medium">
              <button onClick={() => navigate("/home")} className="flex items-center gap-1 hover:text-blue-600">
                <IoHomeOutline size={20} /> Home
              </button>
              <button onClick={() => navigate("/mybookings")} className="flex items-center gap-1 hover:text-blue-600">
                <IoMenuOutline size={20} /> Bookings
              </button>
              
              {/* Medical Records Dropdown - CHHOTA AUR PYARA */}
              <div className="relative medical-dropdown">
                <button
                  onClick={() => setIsMedicalDropdownOpen(!isMedicalDropdownOpen)}
                  className="flex items-center gap-1 hover:text-blue-600 focus:outline-none"
                >
                  <IoAddOutline size={20} /> Medical Records
                  <IoChevronDownOutline size={14} className={`transition-transform duration-200 ${isMedicalDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* CHHOTA DROPDOWN MENU */}
                {isMedicalDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
                    <button
                      onClick={() => {
                        navigate("/medicalrecord");
                        setIsMedicalDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 hover:bg-blue-50 flex items-center gap-2 text-sm transition-colors"
                    >
                      <IoDocumentTextOutline className="text-blue-600" size={16} />
                      <span>View Records</span>
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={() => {
                        navigate("/prescriptions");
                        setIsMedicalDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 hover:bg-green-50 flex items-center gap-2 text-sm transition-colors"
                    >
                      <IoCloudUploadOutline className="text-green-600" size={16} />
                      <span>Upload Record</span>
                    </button>
                  </div>
                )}
              </div>
              
              <button onClick={() => navigate("/chat")} className="flex items-center gap-1 hover:text-blue-600">
                <CiChat1 size={20} /> Chat
              </button>
              <button onClick={() => navigate("/profile")} className="flex items-center gap-1 hover:text-blue-600">
                <IoPersonOutline size={20} /> Profile
              </button>
            </div>

            {/* Wallet */}
            {walletBalance !== null && (
              <div
                onClick={() => navigate('/wallet')}
                className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 transition"
                title="Go to Wallet"
              >
                <IoWalletOutline size={20} />
                <span className="text-sm font-medium">₹{walletBalance}</span>
              </div>
            )}

            {/* Cart with Badge */}
            <button
              onClick={() => navigate("/cart")}
              className="relative flex items-center text-gray-800 hover:text-gray-600"
            >
              <IoCartOutline size={26} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
              <span className="hidden md:inline ml-1">Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* ✅ Bottom Navigation (Mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t z-50">
        <div className="flex justify-around items-center py-2">
          {/* Home */}
          <button onClick={() => navigate("/home")} className="flex flex-col items-center text-gray-700 text-xs">
            <IconWrapper>
              <IoHomeOutline size={22} />
            </IconWrapper>
            Home
          </button>

          {/* Bookings */}
          <button onClick={() => navigate("/mybookings")} className="flex flex-col items-center text-gray-700 text-xs">
            <IconWrapper>
              <IoMenuOutline size={22} />
            </IconWrapper>
            Bookings
          </button>

          {/* Medical Records Dropdown for Mobile - CHHOTA AUR PYARA */}
          <div className="relative medical-dropdown">
            <button
              onClick={() => setIsMedicalDropdownOpen(!isMedicalDropdownOpen)}
              className="flex flex-col items-center text-gray-700 text-xs"
            >
              <IconWrapper>
                <IoAddOutline size={22} />
              </IconWrapper>
              Records
            </button>
            
            {/* Mobile Dropdown - CHHOTA */}
            {isMedicalDropdownOpen && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-slideUp">
                <button
                  onClick={() => {
                    navigate("/medicalrecord");
                    setIsMedicalDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-blue-50 flex items-center gap-2 text-sm"
                >
                  <IoDocumentTextOutline className="text-blue-600" size={14} />
                  <span>View</span>
                </button>
                
                <div className="border-t border-gray-100"></div>
                
                <button
                  onClick={() => {
                    navigate("/prescriptions");
                    setIsMedicalDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 hover:bg-green-50 flex items-center gap-2 text-sm"
                >
                  <IoCloudUploadOutline className="text-green-600" size={14} />
                  <span>Upload</span>
                </button>
              </div>
            )}
          </div>

          {/* Chat */}
          <button onClick={() => navigate("/chat")} className="flex flex-col items-center text-gray-700 text-xs">
            <IconWrapper>
              <CiChat1 size={22} />
            </IconWrapper>
            Chat
          </button>

          {/* Profile */}
          <button onClick={() => navigate("/profile")} className="flex flex-col items-center text-gray-700 text-xs">
            <IconWrapper>
              <IoPersonOutline size={22} />
            </IconWrapper>
            Profile
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 5px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.15s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;