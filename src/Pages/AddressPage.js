import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaEdit, FaTrash, FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import { Helmet } from "react-helmet";

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    addressType: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const staffId = localStorage.getItem("staffId");

  // Fetch addresses
  useEffect(() => {
    if (staffId) {
      axios
        .get(`https://api.credenthealth.com/api/staff/getaddresses/${staffId}`)
        .then((response) => {
          if (response.data && response.data.addresses) {
            setAddresses(response.data.addresses);
          } else {
            setAddresses([]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching addresses:", error);
          setError("Error fetching addresses");
          setLoading(false);
        });
    } else {
      setError("No staffId found in localStorage");
      setLoading(false);
    }
  }, [staffId]);

  const handleInputChange = (e) => {
    setNewAddress({
      ...newAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.country || !newAddress.postalCode) {
      setError("Please fill all required fields");
      return;
    }

    if (editMode && selectedAddress) {
      // Update address
      axios
        .put(
          `https://api.credenthealth.com/api/staff/update-address/${staffId}/${selectedAddress._id}`,
          newAddress
        )
        .then((response) => {
          if (response.data && response.data.updatedAddress) {
            const updatedAddresses = addresses.map((address) =>
              address._id === selectedAddress._id
                ? response.data.updatedAddress
                : address
            );
            setAddresses(updatedAddresses);
            resetForm();
          } else {
            setError("Invalid response from server");
          }
        })
        .catch((error) => {
          console.error("Error updating address:", error);
          setError("Error updating address");
        });
    } else {
      // Add new address
      axios
        .post(
          `https://api.credenthealth.com/api/staff/create-address/${staffId}`,
          newAddress
        )
        .then((response) => {
          if (response.data && response.data.address) {
            setAddresses([...addresses, response.data.address]);
            resetForm();
          } else {
            setError("Invalid response from server");
          }
        })
        .catch((error) => {
          console.error("Error adding address:", error);
          setError("Error adding address");
        });
    }
  };

  const resetForm = () => {
    setNewAddress({
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      addressType: "",
    });
    setEditMode(false);
    setSelectedAddress(null);
    setIsFormVisible(false);
    setError("");
  };

  const handleEdit = (address) => {
    setNewAddress({
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      country: address.country || "",
      postalCode: address.postalCode || "",
      addressType: address.addressType || "",
    });
    setEditMode(true);
    setSelectedAddress(address);
    setIsFormVisible(true);
    setError("");
  };

  const handleRemove = (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      axios
        .delete(
          `https://api.credenthealth.com/api/staff/remove-address/${staffId}/${addressId}`
        )
        .then(() => {
          setAddresses(addresses.filter((a) => a._id !== addressId));
        })
        .catch((error) => {
          console.error("Error removing address:", error);
          setError("Error removing address");
        });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Helmet>
        <title>Address Management | Elthium Health</title>
        <meta name="description" content="Manage your addresses for Elthium Health account" />
        <meta name="keywords" content="address, management, Elthium Health, location" />
      </Helmet>
      
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="flex-grow px-4 py-6">
          {!isFormVisible ? (
            <>
              {/* List Page */}
              <h2 className="text-xl font-bold mb-6">Addresses</h2>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}

              {/* Add button */}
              <button
                onClick={() => setIsFormVisible(true)}
                className="flex items-center border border-blue-500 bg-white text-blue-500 py-3 px-4 rounded-lg w-full mb-6 font-medium"
              >
                <div className="bg-blue-500 text-white p-2 rounded-full mr-2 flex items-center justify-center">
                  <FaPlus size={16} />
                </div>
                Add Address
              </button>

              {/* Addresses List */}
              {loading && (
                <p className="text-center text-gray-600">Loading...</p>
              )}
              {addresses.length === 0 && !loading && (
                <p className="text-center text-gray-600">
                  No addresses found.
                </p>
              )}

              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                  >
                    {/* Left side */}
                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt size={30} className="text-blue-500" />
                      <div>
                        <p className="font-bold text-gray-800">
                          {address.addressType || "Address"}
                        </p>
                        <p className="text-gray-600">
                          {address.street}, {address.city}, {address.state}
                        </p>
                        <p className="text-gray-600">
                          {address.country} - {address.postalCode}
                        </p>
                      </div>
                    </div>

                    {/* Right side - actions */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleEdit(address)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleRemove(address._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Form Page */}
              <h2 className="text-xl font-bold mb-6">
                {editMode ? "Edit Address" : "Add Address"}
              </h2>
              
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="street"
                  value={newAddress.street}
                  onChange={handleInputChange}
                  placeholder="Street *"
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="city"
                  value={newAddress.city}
                  onChange={handleInputChange}
                  placeholder="City *"
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="state"
                  value={newAddress.state}
                  onChange={handleInputChange}
                  placeholder="State *"
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="country"
                  value={newAddress.country}
                  onChange={handleInputChange}
                  placeholder="Country *"
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="postalCode"
                  value={newAddress.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal Code *"
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="addressType"
                  value={newAddress.addressType}
                  onChange={handleInputChange}
                  placeholder="Address Type (Home, Office, etc.)"
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
                  >
                    {editMode ? "Update Address" : "Save Address"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressPage;