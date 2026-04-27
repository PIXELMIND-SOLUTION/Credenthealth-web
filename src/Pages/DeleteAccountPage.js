import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserMinus } from "react-icons/fa";
import Navbar from "./Navbar";

const DeleteAccountPage = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [staffId, setStaffId] = useState(null);

  useEffect(() => {
    const storedStaffId = localStorage.getItem("staffId");
    if (storedStaffId) {
      setStaffId(storedStaffId);
    }
  }, []);

  const handleDelete = async () => {
    if (!staffId) {
      alert("Staff ID not found. Please log in again.");
      return;
    }

    try {
      await axios.delete(
        `https://api.elthiumhealth.com/api/staff/deleteaccount/${staffId}`
      );
      alert("Your account has been deleted successfully.");
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      alert("Failed to delete account. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        {/* Header */}
        <div className="p-4 border-b flex items-center">
          <button onClick={() => navigate(-1)} className="text-xl mr-2">
            ←
          </button>
          <h2 className="text-lg font-semibold">Delete Account</h2>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center px-6 py-10">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-red-50 mb-4">
            <FaUserMinus className="text-red-500 text-4xl" />
          </div>

          <h3 className="text-xl font-semibold mb-2">We're sorry to see you go</h3>
          <p className="text-gray-600 mb-6">
            Deleting your account will remove your profile and all associated data.
          </p>

          {/* What will happen */}
          <div className="bg-gray-50 rounded-xl p-4 w-full max-w-md text-left mb-6">
            <h4 className="font-semibold mb-2">What will happen</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✔ Your profile and history will be permanently removed.</li>
              <li>✔ All associated data will be deleted.</li>
              <li>✔ This action cannot be undone.</li>
            </ul>
          </div>

          {/* Checkbox */}
          <div className="flex items-center space-x-2 mb-6">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-700">
              I understand that this action cannot be undone
            </label>
          </div>

          {/* Delete Button */}
          <button
            disabled={!checked}
            onClick={() => {
              if (window.confirm("Are you sure you want to delete your account?")) {
                handleDelete();
              }
            }}
            className={`w-full max-w-md py-3 rounded-lg font-semibold ${checked
              ? "bg-red-500 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Delete Account
          </button>
        </div>
      </div >
    </div>

  );
};

export default DeleteAccountPage;