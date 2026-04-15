import React, { useState, useRef } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { FiUploadCloud } from 'react-icons/fi';
import { MdSupportAgent } from 'react-icons/md'; // ✅ Support agent icon
import Navbar from './Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate for v6

const HelpPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [fileName, setFileName] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [showPopup, setShowPopup] = useState(false); // Popup visibility state
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // Hook to navigate to home

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmitTicket = async () => {
    try {
      const formData = new FormData();
      formData.append('file', fileInputRef.current.files[0]);
      formData.append('reason', reason);
      formData.append('description', description);

      // Retrieve the staffId from localStorage
      const staffId = localStorage.getItem('staffId');
      if (!staffId) {
        alert('You are not logged in!');
        return;
      }
      formData.append('staffId', staffId);

      const response = await axios.post('https://api.credenthealth.com/api/staff/support-ticket', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Show the popup after successful submission
      setShowPopup(true);

      // Hide the popup after 3 seconds and redirect to home
      setTimeout(() => {
        setShowPopup(false);
        navigate('/home'); // Use navigate to redirect to home
      }, 10000);

      alert(response.data.message); // Show response message
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      alert('There was an error while submitting your ticket.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <IoArrowBack
            size={24}
            className="cursor-pointer"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
              } else {
                window.history.back();
              }
            }}
          />
          <h1 className="text-lg font-semibold">Support</h1>
          {!showForm ? (
            <button className="px-3 py-1 border rounded-full text-sm">Customer Support</button>
          ) : (
            <div className="w-12" />
          )}
        </div>

        {/* Body */}
        <div className="flex-1 flex items-start justify-center px-5 py-6">
          {!showForm ? (
            // First Screen
            <div className="text-center w-full max-w-md">
              <div className="flex flex-col items-center mb-6">
                <MdSupportAgent className="text-gray-500 mb-2" size={64} /> {/* ✅ Icon */}
                <p className="text-gray-500">No support tickets found</p>
                <p className="text-gray-400 text-sm">
                  Create your first support ticket below
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md shadow-md"
              >
                Raise A Ticket
              </button>
            </div>
          ) : (
            // Second Screen (Form)
            <div className="w-full max-w-md space-y-5">
              {/* Reason */}
              <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                <label className="block mb-2 text-gray-700 font-medium">Reason</label>
                <select
                  className="w-full bg-transparent outline-none text-gray-600"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option>Payment Issues</option>
                  <option>Booking Issues</option>
                  <option>Technical Issues</option>
                  <option>Account Issue</option>
                  <option>Consultation Issue</option>
                  <option>App Bug</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                <label className="block mb-2 text-gray-700 font-medium">
                  Description *
                </label>
                <textarea
                  placeholder="Describe your issue in detail..."
                  className="w-full bg-transparent outline-none resize-none"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Upload */}
              <div
                className="bg-purple-50 p-6 rounded-lg shadow-sm text-center cursor-pointer"
                onClick={handleFileClick}
              >
                <FiUploadCloud className="mx-auto mb-2 text-gray-400" size={28} />
                <p className="text-gray-400">
                  {fileName ? fileName : 'Tap to select file'}
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitTicket}
                disabled={!reason || !description}
                className={`w-full py-3 ${!reason || !description ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white'} font-semibold rounded-md shadow-sm`}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Popup Message */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-xs text-center">
            <h2 className="text-lg font-semibold">Ticket Received</h2>
            <p className="text-gray-600 mt-2">
              We have received your support ticket. Our team will contact you soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;
