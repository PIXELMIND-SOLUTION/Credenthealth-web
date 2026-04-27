import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { FaTrash, FaHome } from "react-icons/fa";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const staffId = localStorage.getItem("staffId");

  useEffect(() => {
    if (staffId) {
      setLoading(true);
      axios
        .get(`https://api.elthiumhealth.com/api/staff/mycart/${staffId}`)
        .then((response) => {
          if (response.data.items && response.data.items.length > 0) {
            setCartItems(response.data.items);
            setGrandTotal(response.data.grandTotal);
          } else {
            setCartItems([]);
            setGrandTotal(0);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Error fetching cart data");
          setLoading(false);
        });
    } else {
      setError("No staffId found in localStorage");
      setLoading(false);
    }
  }, [staffId]);

  const handleDeleteItem = (itemId) => {
    if (staffId) {
      axios
        .delete(`https://api.elthiumhealth.com/api/staff/deletecart/${staffId}`, {
          data: { itemId },
        })
        .then((response) => {
          setCartItems(response.data.items);
          setGrandTotal(response.data.grandTotal);
          
          // Clear diagnosticIds from localStorage if cart becomes empty
          if (response.data.items.length === 0) {
            localStorage.removeItem('cartDiagnosticIds');
          }
        })
        .catch(() => {
          setError("Error removing item from cart");
        });
    }
  };

  const handleRedirect = () => {
    // ✅ Get ALL diagnostic IDs from localStorage as array
    const diagnosticIdsJSON = localStorage.getItem('cartDiagnosticIds');
    
    console.log('🔍 Cart Diagnostic IDs from localStorage:', diagnosticIdsJSON);
    
    if (!diagnosticIdsJSON) {
      alert("No diagnostic centers found for the selected scans/tests. Please add scans/tests to cart again.");
      return;
    }
    
    try {
      const diagnosticIds = JSON.parse(diagnosticIdsJSON);
      
      if (!Array.isArray(diagnosticIds) || diagnosticIds.length === 0) {
        alert("Invalid diagnostic center data. Please try again.");
        return;
      }
      
      // ✅ Navigate to diagnostics page with ALL diagnostic IDs as ARRAY
      navigate("/diagnostics", { 
        state: { 
          diagnosticIds, // ✅ ARRAY of IDs
          fromCart: true
        } 
      });
    } catch (err) {
      console.error("Error parsing diagnostic IDs:", err);
      alert("Error processing diagnostic centers. Please try again.");
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col pb-20">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <button
          onClick={() => window.history.back()}
          className="mr-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
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

        <div className="flex-grow px-4 py-4">
          <h2 className="text-xl font-semibold mb-4">Cart</h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {loading && <p className="text-center text-gray-600">Loading...</p>}

          {cartItems.length === 0 && !loading && (
            <div className="text-center text-gray-500">Your cart is empty.</div>
          )}

          {cartItems.length > 0 && (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-lg shadow p-4 relative"
                >
                  {/* Title + Price */}
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                    <span className="font-semibold text-gray-900">
                      ₹{item.totalPayable}
                    </span>
                  </div>

                  {/* Fasting Required */}
                  <p className="text-sm text-gray-600 underline mt-1">
                    {item.fastingRequired ? "Fasting Required" : "No Fasting"}
                  </p>

                  {/* Home Collection */}
                  {item.homeCollectionAvailable && (
                    <div className="mt-3 inline-flex items-center bg-green-100 text-green-700 text-sm px-3 py-1 rounded-lg">
                      <FaHome className="mr-2 text-green-600" />
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleDeleteItem(item.itemId)}
                    className="absolute bottom-3 right-3 flex items-center text-blue-600 border border-blue-400 px-3 py-1 rounded-lg text-sm hover:bg-blue-50"
                  >
                    <FaTrash className="mr-1" /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        {cartItems.length > 0 && (
          <div className="bg-white border-t px-4 py-3">
            <div className="flex justify-between items-center font-semibold text-gray-800 mb-3">
              <p>Total Payable</p>
              <p className="text-blue-600">₹{grandTotal.toFixed(2)}</p>
            </div>
            <button
              onClick={handleRedirect}
              className="w-full bg-[#2E67F6] text-white py-3 rounded-lg font-semibold hover:bg-[#2559cc]"
            >
              Proceed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;