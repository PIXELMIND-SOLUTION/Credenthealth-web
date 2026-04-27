import React, { useState } from "react";
import axios from "axios";
import { FaCamera, FaImage, FaFilePdf, FaArrowLeft } from "react-icons/fa";
import Navbar from "./Navbar";

const PrescriptionPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const staffId = localStorage.getItem("staffId");

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("No file selected. Please choose a file.");
      return;
    }

    if (!staffId) {
      setUploadStatus("Staff ID not found!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadStatus(null);

    try {
      const response = await axios.put(
        `https://api.elthiumhealth.com/api/staff/userupload/${staffId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        setUploadStatus("File uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">

        {/* Upload Card */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => window.history.back()} // ya navigate(-1) use kar sakte ho agar react-router use ho raha hai
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
            <h2 className="text-md font-semibold text-center mb-2">
              Upload Prescription
            </h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              Upload an image or PDF. Supported: JPG, PNG, PDF. Max 10MB
            </p>

            {/* Buttons */}
            <div className="flex justify-around mb-4">
              {/* Camera */}
              <label className="flex flex-col items-center justify-center cursor-pointer bg-gray-100 px-4 py-3 rounded-md shadow hover:bg-gray-200 transition">
                <FaCamera size={20} className="mb-1" />
                <span className="text-sm">Camera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Gallery */}
              <label className="flex flex-col items-center justify-center cursor-pointer bg-gray-100 px-4 py-3 rounded-md shadow hover:bg-gray-200 transition">
                <FaImage size={20} className="mb-1" />
                <span className="text-sm">Gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* PDF Upload */}
            <label className="flex items-center justify-center cursor-pointer bg-gray-100 py-3 rounded-md shadow hover:bg-gray-200 transition mb-4">
              <FaFilePdf size={20} className="mr-2" />
              <span className="text-sm">Upload PDF</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* Upload Guidelines */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
              <h3 className="font-semibold text-sm mb-2">Upload Guidelines</h3>
              <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>Supported formats: JPG, PNG, PDF</li>
                <li>Maximum file size: 10MB</li>
                <li>Ensure prescription is clear and readable</li>
                <li>Include all pages if multiple</li>
              </ul>
            </div>

            {/* Done Button */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-gray-300 text-white py-2 rounded-md transition"
            >
              {uploading ? "Uploading..." : "Done"}
            </button>

            {/* Upload Status */}
            {uploadStatus && (
              <div
                className={`mt-3 text-center text-sm ${uploadStatus.includes("successfully")
                    ? "text-green-500"
                    : "text-red-500"
                  }`}
              >
                {uploadStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPage;
