import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowRight, FaCartPlus, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openPackageId, setOpenPackageId] = useState(null);
  const [openTestId, setOpenTestId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const staffId = localStorage.getItem('staffId');
    if (!staffId) {
      setError('Staff ID not found');
      setLoading(false);
      return;
    }

    const fetchPackages = async () => {
      try {
        const response = await axios.get(
          `https://api.elthiumhealth.com/api/staff/stafftestpackages/${staffId}`
        );
        
        if (response.data && response.data.myPackages) {
          setPackages(response.data.myPackages);
        } else {
          setError('Failed to fetch packages');
        }
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleBooking = (pkg) => {
    navigate('/packagebooking', {
      state: {
        isPackageBooking: true,
        packageId: pkg.packageId || pkg._id,
        packageName: pkg.packageName,
        packagePrice: pkg.price
      }
    });
  };

  const togglePackage = (pkgId) => {
    setOpenPackageId(openPackageId === pkgId ? null : pkgId);
    setOpenTestId(null);
  };

  const toggleTest = (testId) => {
    setOpenTestId(openTestId === testId ? null : testId);
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Packages</h1>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-200 transition">
                <FaCartPlus className="text-xl text-gray-700" />
              </button>
            </div>
          </div>

          <div className="relative max-w-md mb-6">
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-10 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Packages</h2>

          {loading && <p className="text-center text-gray-600">Loading packages...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((pkg) => {
                const initialTests = pkg.includedTests ? pkg.includedTests.slice(0, 2) : [];
                const hasMoreTests = pkg.includedTests && pkg.includedTests.length > 2;

                return (
                  <div
                    key={pkg._id}
                    className="bg-white p-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-800 relative group">
                        {pkg.packageName}
                        <span
                          className="absolute left-0 bottom-0 h-1 bg-blue-500 rounded mt-2"
                          style={{
                            width: 0,
                            animation: 'lineExpand 2s ease forwards',
                          }}
                        ></span>
                      </h3>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-800">₹{pkg.price}</p>
                        <p className="text-sm text-gray-500">Onwards</p>
                      </div>
                    </div>

                    {pkg.description && (
                      <p className="text-gray-700 text-sm mb-2 p-2 rounded">
                        {pkg.description.length > 100
                          ? `${pkg.description.substring(0, 100)}...`
                          : pkg.description
                        }
                      </p>
                    )}

                    <p className="text-gray-500 text-sm mb-2">
                      Total Tests included: {pkg.totalTestsIncluded}
                    </p>

                    {initialTests.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-700 mb-2">Included Tests:</h4>
                        {initialTests.map((test, idx) => (
                          <div key={idx} className="mb-2">
                            <div className="w-full flex items-center text-gray-700 text-sm font-medium p-2 rounded">
                              <FaArrowRight className="text-blue-500 mr-2" />
                              <span>{test.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {pkg.includedTests && pkg.includedTests.length > 0 && (
                      <div className="mt-4 flex justify-between">
                        <button
                          className="flex items-center text-blue-600 text-sm font-medium hover:underline"
                          onClick={() => togglePackage(pkg._id)}
                        >
                          {openPackageId === pkg._id ? 'Hide' : 'Show more'}
                          {openPackageId === pkg._id ? (
                            <FaChevronUp className="ml-1" />
                          ) : (
                            <FaChevronDown className="ml-1" />
                          )}
                        </button>
                        <button
                          className="bg-[#2E67F6] text-white px-4 py-2 rounded hover:bg-[#2559cc] transition"
                          onClick={() => handleBooking(pkg)}
                        >
                          Book Now
                        </button>
                      </div>
                    )}

                    {openPackageId === pkg._id && (
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        {pkg.includedTests && pkg.includedTests.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">All Tests:</h4>
                            {pkg.includedTests.map((test, idx) => (
                              <div key={idx} className="mb-2">
                                <button
                                  className="w-full flex justify-between items-center text-gray-700 text-sm font-medium p-2 bg-gray-100 rounded hover:bg-gray-200 transition"
                                  onClick={() => toggleTest(test._id || idx)}
                                >
                                  <span>
                                    {test.name} ({test.subTestCount} Tests)
                                  </span>
                                  {openTestId === (test._id || idx) ? <FaChevronUp /> : <FaChevronDown />}
                                </button>

                                {openTestId === (test._id || idx) && (
                                  <div className="pl-5 mt-1 text-gray-600 text-sm">
                                    {pkg.description && (
                                      <p className="mb-1">
                                        <strong>Description:</strong> {pkg.description}
                                      </p>
                                    )}
                                    {pkg.precautions && (
                                      <p className="mb-1">
                                        <strong>Precautions:</strong> {pkg.precautions}
                                      </p>
                                    )}
                                    {test.subTests && test.subTests.length > 0 && (
                                      <div className="mb-2">
                                        <strong>Sub Tests:</strong>
                                        <ul className="list-disc pl-5 mt-1">
                                          {test.subTests.map((sub, sidx) => (
                                            <li key={sidx}>{sub}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {pkg.description && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-700 mb-1">Description:</h4>
                            <p className="text-gray-600 text-sm">{pkg.description}</p>
                          </div>
                        )}

                        {pkg.precautions && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-700 mb-1">Precautions:</h4>
                            <p className="text-gray-600 text-sm">{pkg.precautions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 col-span-full">No packages available.</p>
            )}
          </div>
        </main>

        <Footer />
      </div>
      
      <style>
        {`
          @keyframes lineExpand {
            0% { width: 0; }
            100% { width: 100%; }
          }
        `}
      </style>
    </div>
  );
};

export default PackagesPage;