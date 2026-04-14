import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaCartPlus, FaCheck, FaChevronDown, FaChevronUp, FaPlus, FaSearch, FaTrash } from "react-icons/fa";

const ScanAndXRayPage = () => {
  const [scans, setScans] = useState([]);
  const [filteredScans, setFilteredScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [openScanId, setOpenScanId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();
  const staffId = localStorage.getItem("staffId");

  // Fetch cart items on page load
  useEffect(() => {
    if (!staffId) return;

    axios
      .get(`https://api.credenthealth.com/api/staff/mycart/${staffId}`)
      .then((response) => {
        if (response.data.items) {
          setCartItems(response.data.items.map(item => item.itemId));
        }
      })
      .catch(err => console.error("Error fetching cart items:", err));
  }, [staffId]);

  useEffect(() => {
    const fetchScans = async () => {
      if (!staffId) {
        setError("Staff ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://api.credenthealth.com/api/staff/getscans/${staffId}`
        );
        
        console.log("Backend Scan Response:", response.data);
        
        if (response.data && response.data.data) {
          const scansData = response.data.data;
          
          // Transform the data to match the expected format
          const transformedScans = scansData.map(item => {
            const scanData = item.scanId || item;
            
            // ✅ Get ALL diagnostic IDs from multiple sources
            const diagnosticIds = [];
            
            // 1. From item.diagnosticId (single)
            if (item.diagnosticId) {
              diagnosticIds.push(item.diagnosticId._id || item.diagnosticId);
            }
            
            // 2. From scanData.diagnostics array (MOST IMPORTANT - this has all IDs)
            if (scanData.diagnostics && Array.isArray(scanData.diagnostics)) {
              scanData.diagnostics.forEach(id => {
                if (id && !diagnosticIds.includes(id)) {
                  diagnosticIds.push(id);
                }
              });
            }
            
            // 3. Diagnostic name for display
            const diagnosticName = item.diagnosticId?.name || 'Multiple Diagnostics';
            
            return {
              _id: scanData._id,
              title: scanData.title || item.title,
              price: scanData.price || item.price || 0,
              preparation: scanData.preparation || item.preparation,
              reportTime: scanData.reportTime || item.reportTime,
              image: scanData.image || item.image,
              diagnosticIds: diagnosticIds, // ✅ ARRAY of ALL diagnostic IDs
              diagnosticName: diagnosticName
            };
          });
          
          console.log("Transformed Scans with ALL Diagnostic IDs:", transformedScans);
          setScans(transformedScans);
          setFilteredScans(transformedScans);
        } else {
          setError("No scans available");
        }
      } catch (err) {
        console.error("Error fetching scans:", err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, [staffId]);

  // Filter scans based on search
  useEffect(() => {
    const filtered = scans.filter((scan) => {
      if (!scan || !scan.title) return false;
      return scan.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredScans(filtered);
  }, [searchTerm, scans]);

  const openModal = (scan) => {
    setSelectedScan(scan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedScan(null);
  };

  // ✅ Check if cart already has diagnostic IDs
  const getCartDiagnosticIds = () => {
    const diagnosticIdsJSON = localStorage.getItem('cartDiagnosticIds');
    if (diagnosticIdsJSON) {
      try {
        return JSON.parse(diagnosticIdsJSON);
      } catch (err) {
        return [];
      }
    }
    return [];
  };

  // ✅ Merge diagnostic IDs (add new ones to existing)
  const mergeDiagnosticIds = (existingIds, newIds) => {
    if (!existingIds || existingIds.length === 0) return newIds;
    if (!newIds || newIds.length === 0) return existingIds;
    
    const merged = [...existingIds];
    newIds.forEach(id => {
      if (id && !merged.includes(id)) {
        merged.push(id);
      }
    });
    return merged;
  };

  const handleAddToCart = async (scan) => {
    if (!staffId) {
      alert("Staff ID not found in localStorage!");
      return;
    }

    try {
      const response = await axios.post(
        `https://api.credenthealth.com/api/staff/addcart/${staffId}`,
        { 
          itemId: scan._id, 
          action: "inc",
          diagnosticId: scan.diagnosticIds && scan.diagnosticIds.length > 0 
            ? scan.diagnosticIds[0] // First diagnostic as primary
            : null
        }
      );

      if (response.status === 200) {
        // ✅ Store ALL diagnostic IDs in localStorage as array
        if (scan.diagnosticIds && scan.diagnosticIds.length > 0) {
          // Get existing diagnostic IDs from cart
          const existingDiagnosticIds = getCartDiagnosticIds();
          
          // Merge with new diagnostic IDs
          const mergedDiagnosticIds = mergeDiagnosticIds(existingDiagnosticIds, scan.diagnosticIds);
          
          // Store merged array
          localStorage.setItem('cartDiagnosticIds', JSON.stringify(mergedDiagnosticIds));
          console.log('✅ All Scan Diagnostic IDs stored:', mergedDiagnosticIds);
        }
        
        // Add to local cart state
        setCartItems(prev => [...prev, scan._id]);
        setIsModalOpen(false);
        alert(`${scan.title} added to cart successfully!`);
      } else {
        alert("Failed to add item to cart");
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      alert("Error adding item to cart");
    }
  };

  const handleAddToCartNavigate = async (scan) => {
    if (!staffId) {
      alert("Staff ID not found in localStorage!");
      return;
    }

    try {
      const response = await axios.post(
        `https://api.credenthealth.com/api/staff/addcart/${staffId}`,
        { 
          itemId: scan._id, 
          action: "inc",
          diagnosticId: scan.diagnosticIds && scan.diagnosticIds.length > 0 
            ? scan.diagnosticIds[0]
            : null
        }
      );

      if (response.status === 200) {
        // ✅ Store ALL diagnostic IDs in localStorage as array
        if (scan.diagnosticIds && scan.diagnosticIds.length > 0) {
          // Get existing diagnostic IDs from cart
          const existingDiagnosticIds = getCartDiagnosticIds();
          
          // Merge with new diagnostic IDs
          const mergedDiagnosticIds = mergeDiagnosticIds(existingDiagnosticIds, scan.diagnosticIds);
          
          // Store merged array
          localStorage.setItem('cartDiagnosticIds', JSON.stringify(mergedDiagnosticIds));
        }
        
        setCartItems(prev => [...prev, scan._id]);
        setIsModalOpen(false);
        navigate("/cart");
      } else {
        alert("Failed to add item to cart");
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      alert("Error adding item to cart");
    }
  };

  const toggleDetails = (scanId) => {
    setOpenScanId(openScanId === scanId ? null : scanId);
  };

  // Remove from cart
  const handleRemoveFromCart = async (scanId) => {
    if (!staffId) return;
    try {
      const response = await axios.delete(
        `https://api.credenthealth.com/api/staff/deletecart/${staffId}`,
        { data: { itemId: scanId } }
      );
      if (response.status === 200) {
        setCartItems(prev => prev.filter(id => id !== scanId));
        alert('Item removed from cart');
        
        // If cart becomes empty, clear diagnostic IDs
        if (response.data.items.length === 0) {
          localStorage.removeItem('cartDiagnosticIds');
        }
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      alert('Error removing item from cart');
    }
  };

  // Safe rendering function for scan properties
  const renderScanProperty = (value, defaultValue = "N/A") => {
    return value || defaultValue;
  };

  // Show diagnostic info
  const renderDiagnosticInfo = (scan) => {
    if (scan.diagnosticIds && scan.diagnosticIds.length > 1) {
      return (
        <div className="mt-1">
          <span className="text-xs text-blue-600 font-medium">
            Available at {scan.diagnosticIds.length} diagnostic centers
          </span>
        </div>
      );
    } else if (scan.diagnosticIds && scan.diagnosticIds.length === 1) {
      return (
        <div className="mt-1">
          <span className="text-xs text-gray-500">
            {scan.diagnosticName}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      
      {/* Floating Cart Button */}
      <button
        onClick={() => navigate('/cart')}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        title="View Cart"
      >
        <FaCartPlus className="text-xl" />
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </button>
      
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <main className="py-6 px-4 sm:px-6 lg:px-8 flex-1">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Scans & X-Rays</h1>

          {/* Search Box */}
          <div className="flex justify-end mb-6">
            <div className="relative w-full max-w-md mb-6">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search scans & X-rays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {loading && <p className="text-center text-lg text-gray-600">Loading scans...</p>}
          {error && <p className="text-center text-lg text-red-500">{error}</p>}

          {/* Popular Scans Heading */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Scans & X-Rays</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScans.length > 0 ? (
              filteredScans.map((scan) => (
                scan && scan.title ? (
                  <div
                    key={scan._id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-300"
                  >
                    {/* Top row: Name + Price */}
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex-1">
                        <h2 className="text-base font-semibold text-gray-800 relative inline-block pb-1">
                          {renderScanProperty(scan.title)}
                          <span 
                            className="absolute left-0 bottom-0 w-full h-1 bg-blue-500 rounded"
                            style={{
                              animation: "underline 0.3s ease-in-out",
                              marginTop: "18px"
                            }}
                          ></span>
                        </h2>
                        {renderDiagnosticInfo(scan)}
                      </div>
                      <span className="text-base font-semibold text-gray-800">
                        ₹{renderScanProperty(scan.price, "0")}
                      </span>
                    </div>

                    {/* Small details */}
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>
                        Report in: {renderScanProperty(scan.reportTime, "24")} hrs
                      </span>
                      <span>Onwards</span>
                    </div>

                    {/* More info / Book Now */}
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <button
                        className="flex items-center gap-1 font-medium hover:text-gray-700 transition-colors"
                        onClick={() => toggleDetails(scan._id)}
                      >
                        {openScanId === scan._id ? <FaChevronUp /> : <FaChevronDown />}
                        {openScanId === scan._id ? "Less info" : "More info"}
                      </button>

                      <div className="flex items-center gap-2 mt-2">
                        {cartItems.includes(scan._id) ? (
                          <>
                            {/* Added to Cart Label */}
                            <span className="text-sm text-gray-600 font-small">Added to Cart</span>
                            {/* Trash Icon */}
                            <div
                              className="bg-red-100 text-red-600 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
                              onClick={() => handleRemoveFromCart(scan._id)}
                              title="Remove from cart"
                            >
                              <FaTrash className="w-4 h-4" />
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Book Now Button */}
                            <button
                              className="text-white bg-[#2E67F6] px-3 py-2 rounded hover:bg-[#2559cc] transition-colors"
                              onClick={() => openModal(scan)}
                            >
                              Book Now
                            </button>

                            {/* Plus Icon */}
                            <div
                              className="bg-blue-100 text-[#2E67F6] rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
                              onClick={() => handleAddToCart(scan)}
                              title="Add to cart"
                            >
                              <FaPlus className="w-4 h-4" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Preparation details */}
                    {openScanId === scan._id && (
                      <div className="mt-2 p-3 rounded border border-blue-100">
                        {/* Show diagnostic centers info */}
                        {scan.diagnosticIds && scan.diagnosticIds.length > 0 && (
                          <div className="mb-3">
                            <h3 className="text-sm font-semibold text-gray-800 mb-1">
                              Available at {scan.diagnosticIds.length} Diagnostic Center(s)
                            </h3>
                            <p className="text-xs text-gray-600">
                              This scan is available at multiple diagnostic centers
                            </p>
                          </div>
                        )}
                        
                        {scan.preparation && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-1">Preparation</h3>
                            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                              {renderScanProperty(scan.preparation)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null
              ))
            ) : (
              !loading && (
                <p className="text-center text-lg text-gray-500 col-span-full">
                  {searchTerm ? "No scans found matching your search." : "No scans available."}
                </p>
              )
            )}
          </div>
        </main>

        {/* Modal for Add to Cart Confirmation */}
        {isModalOpen && selectedScan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add to Cart</h2>
              <p className="text-gray-600 mb-2">
                Are you sure you want to add <strong>{renderScanProperty(selectedScan.title)}</strong> to your cart?
              </p>
              
              {/* Show diagnostic info in modal */}
              {selectedScan.diagnosticIds && selectedScan.diagnosticIds.length > 1 && (
                <p className="text-sm text-blue-600 mb-4">
                  ⓘ This scan is available at {selectedScan.diagnosticIds.length} diagnostic centers
                </p>
              )}
              
              {selectedScan.diagnosticIds && selectedScan.diagnosticIds.length === 1 && (
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Note:</strong> This scan is associated with {selectedScan.diagnosticName}
                </p>
              )}

              <div className="flex justify-between space-x-4">
                <button
                  className="flex-1 text-white bg-gray-600 p-3 rounded-full hover:bg-gray-500 transition-colors"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  className="flex-1 text-white bg-[#2E67F6] p-3 rounded-full hover:bg-[#2559cc] transition-colors"
                  onClick={() => handleAddToCartNavigate(selectedScan)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>

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

export default ScanAndXRayPage;