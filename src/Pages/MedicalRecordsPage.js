// MedicalRecordsPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaChevronDown, FaChevronUp, FaFilePdf, FaFileAlt, FaEye, FaDownload } from "react-icons/fa";

const MedicalRecordsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openBooking, setOpenBooking] = useState(null);

  const staffId = localStorage.getItem("staffId");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `https://api.credenthealth.com/api/staff/mybookings/${staffId}`
        );

        if (response.data.success && response.data.bookings) {
          setBookings(response.data.bookings.slice().reverse());
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Error fetching bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (staffId) {
      fetchBookings();
    } else {
      setError("Staff ID not found.");
      setLoading(false);
    }
  }, [staffId]);

  const toggleBooking = (index) => {
    setOpenBooking(openBooking === index ? null : index);
  };

  // Function to get full URL
  const getFullUrl = (fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith('http')) {
      return fileUrl;
    }
    return `https://api.credenthealth.com${fileUrl}`;
  };

  // Function to view file
  const viewFile = (fileUrl) => {
    if (fileUrl) {
      const fullUrl = getFullUrl(fileUrl);
      window.open(fullUrl, '_blank');
    } else {
      alert("File not available");
    }
  };

  // Function to download file
  const downloadFile = async (fileUrl, fileName) => {
    if (!fileUrl) {
      alert("File not available");
      return;
    }

    try {
      const fullUrl = getFullUrl(fileUrl);
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'file.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="flex-grow px-4 py-6">
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
          <h1 className="text-xl font-bold text-center text-gray-800 mb-6">
            Medical Records
          </h1>

          {loading ? (
            <p className="text-center text-lg text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-500">{error}</p>
          ) : bookings.length === 0 ? (
            <p className="text-center text-lg text-gray-500">
              No medical records available
            </p>
          ) : (
            bookings.map((booking, index) => {
              const hasReportFile = booking.reportFile && booking.reportFile.trim() !== "";
              const hasDiagPrescription = booking.diagPrescription && booking.diagPrescription.trim() !== "";
              const hasAnyFile = hasReportFile || hasDiagPrescription;
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md border p-4 mb-4"
                >
                  {/* Service Type */}
                  <h2 className="text-base font-semibold text-gray-800 mb-2">
                    {booking.serviceType || "Online Consultation"}
                  </h2>

                  {/* Booking ID & Date */}
                  <p className="text-sm text-gray-700">
                    Booking ID :{" "}
                    {booking.doctorConsultationBookingId ||
                      booking.diagnosticBookingId ||
                      booking.bookingId ||
                      "N/A"}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    Date & Time :{" "}
                    {booking.date
                      ? new Date(booking.date).toLocaleDateString("en-GB")
                      : "N/A"}{" "}
                    , {booking.timeSlot || "--:--"}
                  </p>

                  {/* Files Section - Only show if files exist */}
                  {hasAnyFile && (
                    <div className="mb-3 space-y-2">
                      {/* Diagnostic Report */}
                      {hasReportFile && (
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                          <div className="flex items-center">
                            <FaFilePdf className="text-red-500 mr-2" size={16} />
                            <span className="text-sm font-medium text-gray-700">Medical Report</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewFile(booking.reportFile)}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              <FaEye size={12} />
                              View
                            </button>
                            <button
                              onClick={() => downloadFile(booking.reportFile, "Diagnostic_Report.pdf")}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              <FaDownload size={12} />
                              Download
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Diagnostic Prescription */}
                      {hasDiagPrescription && (
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                          <div className="flex items-center">
                            <FaFileAlt className="text-green-500 mr-2" size={16} />
                            <span className="text-sm font-medium text-gray-700">Medical Prescription</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewFile(booking.diagPrescription)}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              <FaEye size={12} />
                              View
                            </button>
                            <button
                              onClick={() => downloadFile(booking.diagPrescription, "Diagnostic_Prescription.pdf")}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              <FaDownload size={12} />
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom Buttons */}
                  <div className="flex justify-between items-center border-t pt-3">
                    <button
                      onClick={() => toggleBooking(index)}
                      className="flex items-center text-gray-500 text-sm"
                    >
                      {openBooking === index ? (
                        <FaChevronUp className="mr-1" />
                      ) : (
                        <FaChevronDown className="mr-1" />
                      )}
                      Booking Details
                    </button>
                    {!hasAnyFile && (
                      <button className="text-gray-500 border border-gray-300 rounded-md px-3 py-1 text-sm" disabled>
                        No files available
                      </button>
                    )}
                  </div>

                  {/* Expandable Booking Details */}
                  {openBooking === index && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-inner">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">
                        Report Details
                      </h3>
                      <p className="text-sm text-gray-700">
                        <strong>Booking ID:</strong>{" "}
                        {booking.doctorConsultationBookingId ||
                          booking.diagnosticBookingId ||
                          booking.bookingId ||
                          "N/A"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Date:</strong>{" "}
                        {booking.date
                          ? new Date(booking.date).toLocaleDateString("en-GB") +
                          " , " +
                          (booking.timeSlot || "--:--")
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Status:</strong>{" "}
                        {booking.status || "Confirmed"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Total Price:</strong> ₹
                        {booking.totalPrice || "0.00"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Discount:</strong> ₹{booking.discount || "0.00"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Payable Amount:</strong> ₹
                        {booking.payableAmount || booking.totalPrice || "0.00"}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Service Type:</strong>{" "}
                        {booking.serviceType || "Online Consultation"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;