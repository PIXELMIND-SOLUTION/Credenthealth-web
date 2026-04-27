import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import {
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaVenusMars, FaCalendarAlt,
  FaBuilding, FaEdit, FaCamera, FaRulerVertical, FaWeight,
  FaHeartbeat, FaEye, FaTimes, FaSave, FaIdBadge
} from "react-icons/fa";

const MyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedStaffId = localStorage.getItem("staffId");
    if (storedStaffId) {
      setStaffId(storedStaffId);
    } else {
      setError("Staff ID not found. Please log in again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (staffId) {
      fetchStaffProfile();
    }
  }, [staffId]);

  const fetchStaffProfile = () => {
    axios
      .get(`https://api.elthiumhealth.com/api/staff/staffprofile/${staffId}`)
      .then((response) => {
        if (response.data.staff) {
          setStaffProfile(response.data.staff);
          // Initialize edit form with health data including eyesight and employeeId
          setEditForm({
            height: response.data.staff.height || '',
            weight: response.data.staff.weight || '',
            BP: response.data.staff.BP || '',
            BMI: response.data.staff.BMI || '',
            eyeSight: response.data.staff.eyeSight || '',
            eyeCheckupResults: response.data.staff.eyeCheckupResults || '',
            employeeId: response.data.staff.employeeId || ''
          });
        } else {
          setError("Profile data not found.");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch profile. Please try again later.");
        setLoading(false);
        console.error("Profile fetch error:", err);
      });
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `https://api.elthiumhealth.com/api/staff/editprofile/${staffId}`,
        editForm
      );

      if (response.data) {
        setStaffProfile(prev => ({
          ...prev,
          ...editForm
        }));
        setShowEditModal(false);

        // Refresh profile data
        fetchStaffProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      it: "bg-blue-100 text-blue-800",
      hr: "bg-purple-100 text-purple-800",
      finance: "bg-green-100 text-green-800",
      marketing: "bg-pink-100 text-pink-800",
      operations: "bg-orange-100 text-orange-800",
      sales: "bg-teal-100 text-teal-800",
      default: "bg-gray-100 text-gray-800"
    };
    return colors[department?.toLowerCase()] || colors.default;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      manager: "bg-yellow-100 text-yellow-800",
      employee: "bg-green-100 text-green-800",
      supervisor: "bg-purple-100 text-purple-800",
      default: "bg-gray-100 text-gray-800"
    };
    return colors[role?.toLowerCase()] || colors.default;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getFieldLabel = (field) => {
    const labels = {
      name: "Full Name",
      email: "Email Address",
      contact_number: "Contact Number",
      age: "Age",
      gender: "Gender",
      department: "Department",
      employeeId: "Employee ID",
      height: "Height",
      weight: "Weight",
      BP: "Blood Pressure",
      BMI: "BMI",
      eyeSight: "Eye Sight",
      eyeCheckupResults: "Remark"
    };
    return labels[field] || field;
  };

  const getFieldIcon = (field) => {
    const icons = {
      name: <FaUser className="text-gray-400 text-lg" />,
      email: <FaEnvelope className="text-gray-400 text-lg" />,
      contact_number: <FaPhone className="text-gray-400 text-lg" />,
      age: <FaCalendarAlt className="text-gray-400 text-lg" />,
      gender: <FaVenusMars className="text-gray-400 text-lg" />,
      department: <FaBuilding className="text-gray-400 text-lg" />,
      employeeId: <FaIdBadge className="text-gray-400 text-lg" />,
      height: <FaRulerVertical className="text-gray-400 text-lg" />,
      weight: <FaWeight className="text-gray-400 text-lg" />,
      BP: <FaHeartbeat className="text-gray-400 text-lg" />,
      BMI: <FaHeartbeat className="text-gray-400 text-lg" />,
      eyeSight: <FaEye className="text-gray-400 text-lg" />,
      eyeCheckupResults: <FaEye className="text-gray-400 text-lg" />
    };
    return icons[field] || <FaUser className="text-gray-400 text-lg" />;
  };

  const getFieldValue = (field, value) => {
    if (!value && value !== 0) return 'null';

    if (field === 'name' && typeof value === 'string') {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    switch (field) {
      case 'height':
        return `${value} cm`;
      case 'weight':
        return `${value} kg`;
      case 'employeeId':
        return value || 'Not Assigned';
      default:
        return value;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !staffProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Profile</h3>
            <p className="text-gray-600 mt-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!staffProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-gray-900">No Profile Data</h3>
            <p className="text-gray-600 mt-2">Unable to load profile information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          <div className="relative px-6 pb-6">
            <div className="relative -top-16 mb-4">
              <div className="w-32 h-32 mx-auto">
                <img
                  src={
                    staffProfile.profileImage ||
                    staffProfile.image ||
                    staffProfile.avatar ||
                    staffProfile.profilePicture ||
                    staffProfile.profile_url ||
                    "https://www.jrplumbingandheatingltd.co.uk/wp-content/uploads/2019/03/Anon.jpg"
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    e.target.src = "https://www.jrplumbingandheatingltd.co.uk/wp-content/uploads/2019/03/Anon.jpg";
                  }}
                />
              </div>
            </div>

            {/* Name and Basic Info */}
            <div className="text-center -mt-8 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {staffProfile.name ? staffProfile.name.charAt(0).toUpperCase() + staffProfile.name.slice(1) : 'No Name'}
              </h1>
              <div className="flex flex-col items-center gap-2 mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(staffProfile.role)}`}>
                  {staffProfile.role}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDepartmentColor(staffProfile.department)}`}>
                  {staffProfile.department}
                </span>
                {staffProfile.employeeId && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <FaIdBadge className="mr-2" />
                    ID: {staffProfile.employeeId}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              </div>

              <div className="space-y-4">
                {['name', 'email', 'contact_number', 'age', 'gender', 'employeeId'].map(field => (
                  <div key={field} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      {getFieldIcon(field)}
                      <div>
                        <p className="text-sm text-gray-500">{getFieldLabel(field)}</p>
                        <p className="font-medium text-gray-900">
                          {getFieldValue(field, staffProfile[field])}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>

              <div className="space-y-4">
                {['department'].map(field => (
                  <div key={field} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      {getFieldIcon(field)}
                      <div>
                        <p className="text-sm text-gray-500">{getFieldLabel(field)}</p>
                        <p className="font-medium text-gray-900">
                          {getFieldValue(field, staffProfile[field])}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Staff ID (Non-editable) */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaIdCard className="text-gray-400 text-lg" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium text-gray-900">{staffProfile.userId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Information with Edit Icon */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Health Information</h2>
                <button
                  onClick={handleEditClick}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  title="Edit Health Information"
                >
                  <FaEdit className="text-lg" />
                </button>
              </div>

              <div className="space-y-4">
                {['height', 'weight', 'BP', 'BMI', 'eyeSight'].map(field => (
                  <div key={field} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      {getFieldIcon(field)}
                      <div>
                        <p className="text-sm text-gray-500">{getFieldLabel(field)}</p>
                        <p className="font-medium text-gray-900">
                          {getFieldValue(field, staffProfile[field])}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Special big container for Remark */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getFieldIcon('eyeCheckupResults')}
                    <div className="flex-1 w-full">
                      <p className="text-sm text-gray-500 mb-2">{getFieldLabel('eyeCheckupResults')}</p>
                      <div className="font-medium text-gray-900 bg-white p-4 rounded border border-gray-200 min-h-[150px] max-h-64 overflow-y-auto break-all whitespace-pre-wrap overflow-x-hidden w-full">
                        {staffProfile.eyeCheckupResults || 'null'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(staffProfile.createdAt).split(',')[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal - Health Information and Employee ID */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">
                Edit Information
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="p-4">
              {/* Employee ID Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={editForm.employeeId || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Employee ID"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Unique identification number for the employee</p>
                  </div>
                </div>
              </div>

              {/* Health Information Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={editForm.height || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter height"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={editForm.weight || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter weight"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      name="BP"
                      value={editForm.BP || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 120/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BMI
                    </label>
                    <input
                      type="number"
                      name="BMI"
                      value={editForm.BMI || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter BMI"
                      step="0.1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eye Sight
                    </label>
                    <input
                      type="text"
                      name="eyeSight"
                      value={editForm.eyeSight || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 6/6, 20/20"
                    />
                  </div>
                </div>

                {/* Remark Section - BADA TEXTAREA */}
                <div className="mt-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remark
                    </label>
                    <textarea
                      name="eyeCheckupResults"
                      value={editForm.eyeCheckupResults || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[300px] text-base leading-relaxed"
                      placeholder="Enter detailed remarks here..."
                      rows="15"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end space-x-2 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="text-sm" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;