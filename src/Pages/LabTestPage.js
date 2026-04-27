import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCartPlus, FaCheck, FaChevronDown, FaChevronUp, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const LabTestPage = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [openTestId, setOpenTestId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();
  const staffId = localStorage.getItem('staffId');

  // Fetch cart items on page load
  useEffect(() => {
    if (!staffId) return;

    axios
      .get(`https://api.elthiumhealth.com/api/staff/mycart/${staffId}`)
      .then((response) => {
        if (response.data.items) {
          setCartItems(response.data.items.map(item => item.itemId));
        }
      })
      .catch(err => console.error("Error fetching cart items:", err));
  }, [staffId]);

 useEffect(() => {
  const fetchTests = async () => {
    if (!staffId) {
      setError("Staff ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://api.elthiumhealth.com/api/staff/gettests/${staffId}`);
      
      console.log("Backend Response:", response.data);
      
      if (response.data && response.data.data) {
        const testsData = response.data.data;
        
        const transformedTests = testsData.map(item => {
          const testData = item.testId || item;
          
          // Get all diagnostic IDs from multiple sources
          const diagnosticIds = [];
          
          // 1. From item.diagnosticId (single)
          if (item.diagnosticId) {
            diagnosticIds.push(item.diagnosticId._id || item.diagnosticId);
          }
          
          // 2. From testData.diagnostics array
          if (testData.diagnostics && Array.isArray(testData.diagnostics)) {
            testData.diagnostics.forEach(id => {
              if (id && !diagnosticIds.includes(id)) {
                diagnosticIds.push(id);
              }
            });
          }
          
          // 3. From allDiagnostics array (if backend returns it)
          if (item.allDiagnostics && Array.isArray(item.allDiagnostics)) {
            item.allDiagnostics.forEach(diag => {
              if (diag._id && !diagnosticIds.includes(diag._id)) {
                diagnosticIds.push(diag._id);
              }
            });
          }
          
          return {
            _id: testData._id,
            name: testData.name || item.testName,
            price: testData.price || item.price,
            fastingRequired: testData.fastingRequired || item.fastingRequired,
            homeCollectionAvailable: testData.homeCollectionAvailable || item.homeCollectionAvailable,
            reportIn24Hrs: testData.reportIn24Hrs || item.reportIn24Hrs,
            reportHour: testData.reportHour || item.reportHour,
            description: testData.description || item.description,
            instruction: testData.instruction || item.instruction,
            precaution: testData.precaution || item.precaution,
            category: testData.category || item.category,
            subTests: testData.subTests || item.subTests,
            diagnosticIds: diagnosticIds, // ✅ ARRAY of ALL diagnostic IDs
            diagnosticName: item.diagnosticId?.name || testData.diagnosticName || 'Multiple Diagnostics'
          };
        });
        
        console.log("Transformed Tests with ALL Diagnostic IDs:", transformedTests);
        setTests(transformedTests);
        setFilteredTests(transformedTests);
      } else {
        setError('No tests available');
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  fetchTests();
}, [staffId]);

  // Filter tests based on search
  useEffect(() => {
    const filtered = tests.filter((test) => {
      if (!test || !test.name) return false;
      
      return test.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredTests(filtered);
  }, [searchTerm, tests]);

  const openModal = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTest(null);
  };

 const handleAddToCart = async (test) => {
  if (!staffId) {
    alert('Staff ID not found in localStorage!');
    return;
  }

  try {
    const response = await axios.post(
      `https://api.elthiumhealth.com/api/staff/addcart/${staffId}`,
      { 
        itemId: test._id, 
        action: 'inc',
        diagnosticId: test.diagnosticIds && test.diagnosticIds.length > 0 
          ? test.diagnosticIds[0] // First diagnostic as primary
          : null
      }
    );

    if (response.status === 200) {
      // ✅ Store ALL diagnostic IDs in localStorage as array
      if (test.diagnosticIds && test.diagnosticIds.length > 0) {
        localStorage.setItem('cartDiagnosticIds', JSON.stringify(test.diagnosticIds));
        console.log('✅ All Diagnostic IDs stored:', test.diagnosticIds);
      }
      
      // Add to local cart state
      setCartItems(prev => [...prev, test._id]);
      setIsModalOpen(false);
      alert(`${test.name} added to cart successfully!`);
    } else {
      alert('Failed to add item to cart');
    }
  } catch (err) {
    console.error("❌ Error adding to cart:", err);
    alert('Error adding item to cart');
  }
};

  const handleAddToCartNavigate = async (test) => {
  if (!staffId) {
    alert('Staff ID not found in localStorage!');
    return;
  }

  try {
    const response = await axios.post(
      `https://api.elthiumhealth.com/api/staff/addcart/${staffId}`,
      { 
        itemId: test._id, 
        action: 'inc',
        diagnosticId: test.diagnosticIds && test.diagnosticIds.length > 0 
          ? test.diagnosticIds[0]
          : null
      }
    );

    if (response.status === 200) {
      // ✅ Store ALL diagnostic IDs in localStorage as array
      if (test.diagnosticIds && test.diagnosticIds.length > 0) {
        localStorage.setItem('cartDiagnosticIds', JSON.stringify(test.diagnosticIds));
      }
      
      setCartItems(prev => [...prev, test._id]);
      setIsModalOpen(false);
      navigate('/cart');
    } else {
      alert('Failed to add item to cart');
    }
  } catch (err) {
    console.error("❌ Error adding to cart:", err);
    alert('Error adding item to cart');
  }
};

  const toggleDetails = (testId) => {
    setOpenTestId(openTestId === testId ? null : testId);
  };

  // Remove from cart
  const handleRemoveFromCart = async (testId) => {
    if (!staffId) return;
    try {
      const response = await axios.delete(
        `https://api.elthiumhealth.com/api/staff/deletecart/${staffId}`,
        { data: { itemId: testId } }
      );
      if (response.status === 200) {
        setCartItems(prev => prev.filter(id => id !== testId));
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

  // Safe rendering function for test properties
  const renderTestProperty = (value, defaultValue = 'N/A') => {
    return value || defaultValue;
  };

  // Show diagnostic info
  const renderDiagnosticInfo = (test) => {
    if (test.diagnosticIds && test.diagnosticIds.length > 1) {
      return (
        <div className="mt-1">
          <span className="text-xs text-blue-600 font-medium">
            Available at {test.diagnosticIds.length} diagnostic centers
          </span>
        </div>
      );
    } else if (test.diagnosticIds && test.diagnosticIds.length === 1) {
      return (
        <div className="mt-1">
          <span className="text-xs text-gray-500">
            {test.diagnosticName}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <main className="py-6 px-4 sm:px-6 lg:px-8 flex-1">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Lab Tests</h1>

          {/* Search Box */}
          <div className="flex justify-end mb-6">
            <div className="relative w-full max-w-md mb-6">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search lab tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {loading && <p className="text-center text-lg text-gray-600">Loading tests...</p>}
          {error && <p className="text-center text-lg text-red-500">{error}</p>}

          {/* Popular Tests Heading */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Popular Tests</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                test && test.name ? (
                  <div
                    key={test._id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-300"
                  >
                    {/* Top row: Name + Price */}
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex-1">
                        <h2 className="text-base font-semibold text-gray-800 relative inline-block pb-1">
                          {renderTestProperty(test.name)}
                          <span 
                            className="absolute left-0 bottom-0 w-full h-1 bg-blue-500 rounded"
                            style={{
                              animation: "underline 0.3s ease-in-out",
                              marginTop: "18px"
                            }}
                          ></span>
                        </h2>
                        {renderDiagnosticInfo(test)}
                      </div>
                      <span className="text-base font-semibold text-gray-800">
                        ₹{renderTestProperty(test.price, '0')}
                      </span>
                    </div>

                    {/* Small details */}
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>
                        {test.fastingRequired ? 'Fasting Required' : 'No Fasting'}
                      </span>
                      <span>Onwards</span>
                    </div>

                    {/* Home collection badge */}
                    {test.homeCollectionAvailable && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full mb-2">
                        <FaCheck className="inline mr-1" /> Home Collection Available
                      </span>
                    )}

                    {/* More info / Book Now */}
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <button
                        className="flex items-center gap-1 font-medium hover:text-gray-700 transition-colors"
                        onClick={() => toggleDetails(test._id)}
                      >
                        {openTestId === test._id ? <FaChevronUp /> : <FaChevronDown />}
                        {openTestId === test._id ? "Less info" : "More info"}
                      </button>

                      <div className="flex items-center gap-2 mt-2">
                        {cartItems.includes(test._id) ? (
                          <>
                            {/* Added to Cart Label */}
                            <span className="text-sm text-gray-600 font-small">Added to Cart</span>
                            {/* Trash Icon */}
                            <div
                              className="bg-red-100 text-red-600 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
                              onClick={() => handleRemoveFromCart(test._id)}
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
                              onClick={() => openModal(test)}
                            >
                              Book Now
                            </button>

                            {/* Plus Icon */}
                            <div
                              className="bg-blue-100 text-[#2E67F6] rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
                              onClick={() => handleAddToCart(test)}
                              title="Add to cart"
                            >
                              <FaPlus className="w-4 h-4" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description / Instruction */}
                    {openTestId === test._id && (
                      <div className="mt-2 p-3 rounded border border-blue-100">
                        {/* Show diagnostic centers info */}
                        {test.diagnosticIds && test.diagnosticIds.length > 0 && (
                          <div className="mb-3">
                            <h3 className="text-sm font-semibold text-gray-800 mb-1">
                              Available at {test.diagnosticIds.length} Diagnostic Center(s)
                            </h3>
                            <p className="text-xs text-gray-600">
                              This test is available at multiple diagnostic centers
                            </p>
                          </div>
                        )}
                        
                        {test.description && (
                          <div className="mb-2">
                            <h3 className="text-sm font-semibold text-gray-800 mb-1">Description</h3>
                            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                              {renderTestProperty(test.description)}
                            </p>
                          </div>
                        )}
                        {test.instruction && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-1">Instructions</h3>
                            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                              {renderTestProperty(test.instruction)}
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
                  {searchTerm ? 'No tests found matching your search.' : 'No lab tests available.'}
                </p>
              )
            )}
          </div>
        </main>

        {/* Modal for Add to Cart Confirmation */}
        {isModalOpen && selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add to Cart</h2>
              <p className="text-gray-600 mb-2">
                Are you sure you want to add <strong>{renderTestProperty(selectedTest.name)}</strong> to your cart?
              </p>
              
              {/* Show diagnostic info in modal */}
              {selectedTest.diagnosticIds && selectedTest.diagnosticIds.length > 1 && (
                <p className="text-sm text-blue-600 mb-4">
                  ⓘ This test is available at {selectedTest.diagnosticIds.length} diagnostic centers
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
                  onClick={() => handleAddToCartNavigate(selectedTest)}
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

export default LabTestPage;