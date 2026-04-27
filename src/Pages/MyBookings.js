import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaMapMarkerAlt, FaFlask, FaXRay, FaStethoscope, FaBox } from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const staffId = localStorage.getItem("staffId");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateString, setSelectedDateString] = useState("");
  
  // ✅ New filter state
  const [filter, setFilter] = useState('all'); // 'all', 'package', 'doctor', 'diagnostic', 'xray', 'test'
  
  // ✅ CRITICAL FIX: useRef ka use karo real-time value ke liye
  const selectedDateStringRef = useRef("");
  const selectedBookingRef = useRef(null);

  useEffect(() => {
    if (!staffId) {
      setError("Staff ID is missing. Please log in again.");
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [staffId]);

  // ✅ Fetch Bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.credenthealth.com/api/staff/mybookings/${staffId}`
      );
      if (response.data.success) {
        setBookings(response.data.bookings);
      } else {
        setError("Failed to fetch bookings");
      }
    } catch (err) {
      setError(
        "Error fetching bookings: " +
        (err.response?.data?.message || err.message)
      );
      console.error("Booking fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Determine booking type with DETAILED logic
  const getBookingType = (booking) => {
    // First check for package
    if (booking.package && booking.package._id) {
      return 'package';
    }
    
    // Check if it has doctor consultation ID
    if (booking.doctorConsultationBookingId || booking.doctorId) {
      return 'doctor';
    }
    
    // Check for diagnostic booking ID
    if (booking.diagnosticBookingId) {
      // Now check cart items to determine if xray or test
      if (booking.cartItems && booking.cartItems.length > 0) {
        const hasXray = booking.cartItems.some(item => item.type === "xray");
        const hasTest = booking.cartItems.some(item => item.type === "test");
        
        if (hasXray && !hasTest) return 'xray';
        if (hasTest && !hasXray) return 'test';
        if (hasXray && hasTest) return 'diagnostic'; // mixed
      }
      return 'diagnostic'; // default for diagnostic
    }
    
    return 'other';
  };

  // ✅ Filter bookings based on selected filter
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    
    const bookingType = getBookingType(booking);
    
    if (filter === 'package') return bookingType === 'package';
    if (filter === 'doctor') return bookingType === 'doctor';
    if (filter === 'diagnostic') return bookingType === 'diagnostic' || bookingType === 'test' || bookingType === 'xray';
    if (filter === 'xray') return bookingType === 'xray';
    if (filter === 'test') return bookingType === 'test';
    
    return true;
  });

  // ✅ Cancel Booking
  const handleCancelBooking = async (booking) => {
    try {
      const response = await axios.put(
        `https://api.credenthealth.com/api/staff/cancel-booking/${staffId}/${booking.bookingId || booking._id}`,
        { status: "Cancelled" }
      );
      if (response.data.booking) {
        alert("Booking successfully cancelled.");
        fetchBookings();
        setSelectedBooking(null);
      } else {
        alert(response.data.message || "Failed to cancel booking.");
      }
    } catch (error) {
      console.error("Cancel Error:", error);
      alert("Error while cancelling booking.");
    }
  };

  // ✅ SIMPLE DATE FORMATTER - NO TIMEZONE GAMES
  const formatDateForAPI = (date) => {
    if (!date) return '';
    
    // Direct date components - sabse simple
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    
    const result = `${year}-${month}-${day}`;
    
    // Debug log
    console.log(`📅 formatDateForAPI: ${date.getDate()} -> ${result}`);
    
    return result;
  };

  // ✅ Format date for display in Indian format
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ CRITICAL FIX: Real-time fetch function with refs - ERROR MESSAGE FIXED
  const fetchAvailableSlots = async (dateToUse = null) => {
    // Use passed date OR ref value (ref has real-time value)
    const dateString = dateToUse || selectedDateStringRef.current;
    const booking = selectedBookingRef.current;
    
    if (!booking || !dateString) {
      console.log("❌ Missing booking or date");
      return;
    }
    
    console.log("🔥🔥🔥 FINAL DATE FOR API:", dateString);
    console.log("🔥 State value (may be old):", selectedDateString);
    
    setLoadingSlots(true);
    
    try {
      let response;
      
      // Diagnostic Booking
      if (booking.diagnosticBookingId && booking.serviceType) {
        const diagnosticId = booking.diagnostic?.diagnosticId?._id;
        if (!diagnosticId) {
          alert("Diagnostic center information not found.");
          return;
        }
        
        console.log(`📞 API CALL: date=${dateString}, type=${booking.serviceType}`);
        
        response = await axios.get(
          `https://api.credenthealth.com/api/staff/diagnosticslots/${diagnosticId}?date=${dateString}&type=${booking.serviceType}`
        );
        
        if (response.data.slots && response.data.slots.length > 0) {
          setAvailableSlots(response.data.slots);
        } else if (response.data.homeCollectionSlots || response.data.centerVisitSlots) {
          const slots = booking.serviceType === "Home Collection" 
            ? response.data.homeCollectionSlots 
            : response.data.centerVisitSlots;
          setAvailableSlots(slots || []);
        } else {
          setAvailableSlots([]);
          console.log("No slots available for selected date");
        }
      } 
      // Doctor Booking
      else if (booking.doctorId) {
        response = await axios.get(
          `https://api.credenthealth.com/api/staff/doctor-slots/${booking.doctorId}?date=${dateString}&type=${booking.type}`
        );
        if (response.data.slots && response.data.slots.length > 0) {
          setAvailableSlots(response.data.slots);
        } else {
          setAvailableSlots([]);
          console.log("No slots available for selected date");
        }
      } else {
        alert("Cannot reschedule this booking type");
        return;
      }
      
      console.log("✅ API Response received");
    } catch (error) {
      console.error("Error fetching slots:", error);
      if (error.response?.status === 404) {
        console.log("No slots available. Please try another date.");
      } else {
        alert("Error fetching slots. Please try again.");
      }
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // ✅ Confirm Reschedule
  const confirmReschedule = async () => {
    const dateString = selectedDateStringRef.current;
    const booking = selectedBookingRef.current;
    
    if (!booking || !dateString || !selectedSlot) {
      alert("Please select a date and slot before confirming.");
      return;
    }

    console.log("✅ Rescheduling with:", dateString);

    try {
      let endpoint;
      let data;
      
      // Diagnostic Reschedule
      if (booking.diagnosticBookingId) {
        endpoint = `https://api.credenthealth.com/api/staff/diagreschedule/${staffId}/${booking.bookingId || booking._id}`;
        data = {
          newDate: dateString,
          newTimeSlot: selectedSlot,
          serviceType: booking.serviceType
        };
      } 
      // Doctor Reschedule
      else {
        endpoint = `https://api.credenthealth.com/api/staff/reschedulebooking/${staffId}/${booking.bookingId || booking._id}`;
        data = {
          newDay: new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
          }),
          newDate: dateString,
          newTimeSlot: selectedSlot,
        };
      }

      const response = await axios.put(endpoint, data);

      if (response.data.isSuccessfull || response.data.success) {
        alert("Booking rescheduled successfully.");
        fetchBookings();
        setShowReschedule(false);
        setSelectedBooking(null);
        selectedBookingRef.current = null;
        setSelectedSlot("");
        setAvailableSlots([]);
        setSelectedDateString("");
        selectedDateStringRef.current = "";
      } else {
        alert(response.data.message || "Failed to reschedule booking.");
      }
    } catch (error) {
      console.error("Reschedule Error:", error);
      alert("Error while rescheduling booking: " + (error.response?.data?.message || error.message));
    }
  };

  /* 🔹 Open Google Maps with address */
  const openGoogleMaps = (address) => {
    if (!address) {
      alert("Address not available");
      return;
    }
    
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  // ✅ Handle Reschedule Button Click - FIXED WITH REFS
  const handleRescheduleClick = (booking) => {
    // Update refs immediately
    selectedBookingRef.current = booking;
    
    const bookingDate = new Date(booking.date);
    const dateString = formatDateForAPI(bookingDate);
    
    selectedDateStringRef.current = dateString;
    
    console.log("🎯 handleRescheduleClick:");
    console.log("  Booking:", booking.diagnosticBookingId || booking.bookingId);
    console.log("  Date set in ref:", dateString);
    
    // Update states
    setSelectedBooking(booking);
    setSelectedDate(bookingDate);
    setSelectedDateString(dateString);
    setSelectedSlot("");
    setAvailableSlots([]);
    setShowReschedule(true);
    
    // Fetch slots with current ref value
    fetchAvailableSlots(dateString);
  };

  // ✅ Handle Date Selection - FIXED WITH REFS
  const handleDateSelect = (date) => {
    const dateString = formatDateForAPI(date);
    
    // Update ref immediately
    selectedDateStringRef.current = dateString;
    
    console.log("🎯 handleDateSelect:");
    console.log("  Selected day:", date.getDate());
    console.log("  Date set in ref:", dateString);
    
    // Update states
    setSelectedDate(date);
    setSelectedDateString(dateString);
    setSelectedSlot("");
    
    // Fetch with ref value
    fetchAvailableSlots(dateString);
  };

  // ✅ Generate dates for the date selector
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // ✅ Get booking badge with icon
  const getBookingBadge = (booking) => {
    const bookingType = getBookingType(booking);
    
    switch(bookingType) {
      case 'package':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          border: 'border-l-4 border-purple-500',
          icon: <FaBox className="w-3 h-3 mr-1" />,
          label: 'PACKAGE'
        };
      case 'doctor':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-l-4 border-green-500',
          icon: <FaStethoscope className="w-3 h-3 mr-1" />,
          label: 'DOCTOR'
        };
      case 'xray':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-l-4 border-orange-500',
          icon: <FaXRay className="w-3 h-3 mr-1" />,
          label: 'X-RAY/SCAN'
        };
      case 'test':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-l-4 border-blue-500',
          icon: <FaFlask className="w-3 h-3 mr-1" />,
          label: 'LAB TEST'
        };
      case 'diagnostic':
      default:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-l-4 border-yellow-500',
          icon: <FaFlask className="w-3 h-3 mr-1" />,
          label: 'DIAGNOSTIC'
        };
    }
  };

  // ✅ Get item type badge
  const getItemTypeBadge = (item) => {
    if (item.type === "xray") {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full flex items-center w-fit">
          <FaXRay className="w-3 h-3 mr-1" />
          X-RAY/SCAN
        </span>
      );
    } else if (item.type === "test") {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center w-fit">
          <FaFlask className="w-3 h-3 mr-1" />
          LAB TEST
        </span>
      );
    }
    return null;
  };

  // ✅ Render Package Booking Content
  const renderPackageBookingContent = (booking) => {
    const badge = getBookingBadge(booking);
    
    return (
      <>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {/* Package Badge */}
            <div className={`inline-flex items-center ${badge.bg} ${badge.text} text-xs font-semibold px-2 py-1 rounded mb-2`}>
              {badge.icon}
              {badge.label}
            </div>
            
            <h3 className="font-bold text-gray-800 text-lg">
              {booking.package?.name || "Health Package"}
            </h3>
            
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Includes:</span> {booking.package?.totalTestsIncluded || 0} Tests
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Type:</span> {booking.serviceType || "Diagnostic"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-lg font-bold text-purple-700">
              ₹{booking.payableAmount || booking.totalPrice}
            </span>
            <p className="text-xs text-gray-500 mt-1">Package Price</p>
          </div>
        </div>

        {/* Booking ID */}
        <p className="text-sm bg-gray-50 p-2 rounded mt-2">
          <span className="font-semibold">Booking ID:</span>{" "}
          <span className="font-mono">{booking.diagnosticBookingId || booking.bookingId}</span>
        </p>

        {/* Date & Time */}
        <div className="flex items-center mt-3 text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
          </svg>
          <span className="font-semibold mr-2">Date & Time:</span>
          {formatDateForDisplay(booking.date)} , {booking.timeSlot}
        </div>

        {/* Tests Preview */}
        {booking.package && (
          <div className="mt-3 bg-blue-50 p-3 rounded">
            <p className="text-sm font-semibold text-blue-800 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Package Includes {booking.package.totalTestsIncluded} Tests
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Comprehensive health screening package
            </p>
          </div>
        )}
      </>
    );
  };

  // ✅ Render Diagnostic/Xray/Test Booking Content
  const renderDiagnosticBookingContent = (booking) => {
    const bookingType = getBookingType(booking);
    const badge = getBookingBadge(booking);
    
    // Get items summary
    const xrayCount = booking.cartItems?.filter(item => item.type === "xray").length || 0;
    const testCount = booking.cartItems?.filter(item => item.type === "test").length || 0;
    
    return (
      <>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {/* Booking Type Badge */}
            <div className={`inline-flex items-center ${badge.bg} ${badge.text} text-xs font-semibold px-2 py-1 rounded mb-2`}>
              {badge.icon}
              {badge.label}
            </div>
            
            <h3 className="font-bold text-gray-800 text-lg">
              {booking.serviceType === "Home Collection" 
                ? `${bookingType === 'xray' ? 'X-Ray/Scan' : bookingType === 'test' ? 'Lab Test' : 'Diagnostic'} (Home Collection)` 
                : booking.serviceType === "Center Visit"
                ? `${bookingType === 'xray' ? 'X-Ray/Scan' : bookingType === 'test' ? 'Lab Test' : 'Diagnostic'} (Center Visit)`
                : `${bookingType === 'xray' ? 'X-Ray/Scan' : bookingType === 'test' ? 'Lab Test' : 'Diagnostic'} Consultation`}
            </h3>
            
            {/* Items Summary */}
            <div className="mt-2 flex flex-wrap gap-2">
              {xrayCount > 0 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  {xrayCount} X-Ray{ xrayCount > 1 ? 's' : ''}
                </span>
              )}
              {testCount > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {testCount} Test{ testCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Items List Preview */}
            {booking.cartItems && booking.cartItems.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Includes:</p>
                <div className="max-h-20 overflow-y-auto">
                  {booking.cartItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center text-sm mb-1">
                      {getItemTypeBadge(item)}
                      <span className="ml-2 text-gray-700 truncate">{item.title}</span>
                    </div>
                  ))}
                  {booking.cartItems.length > 3 && (
                    <p className="text-xs text-gray-500">+{booking.cartItems.length - 3} more items</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <span className="text-lg font-bold text-gray-800">
              ₹{booking.payableAmount || booking.totalPrice}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {bookingType === 'xray' ? 'X-Ray Cost' : bookingType === 'test' ? 'Test Cost' : 'Diagnostic Cost'}
            </p>
          </div>
        </div>

        {/* Booking ID */}
        <p className="text-sm bg-gray-50 p-2 rounded mt-2">
          <span className="font-semibold">Booking ID:</span>{" "}
          <span className="font-mono">{booking.diagnosticBookingId || booking.bookingId}</span>
        </p>

        {/* Date & Time */}
        <div className="flex items-center mt-3 text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
          </svg>
          <span className="font-semibold mr-2">Date & Time:</span>
          {formatDateForDisplay(booking.date)} , {booking.timeSlot}
        </div>

        {booking.serviceType === "Center Visit" && booking.diagnostic && booking.diagnostic.address && (
          <p className="text-sm mt-2 flex items-center">
            <span className="font-semibold mr-2">Center Address:</span>
            <span
              className="text-blue-700 cursor-pointer hover:text-blue-500 transition-colors break-words"
              onClick={() => openGoogleMaps(booking.diagnostic.address)}
              title="Click to open in Google Maps"
            >
              <FaMapMarkerAlt className="inline-block mr-1" />
              {booking.diagnostic.address}
            </span>
          </p>
        )}
      </>
    );
  };

  // ✅ Render Doctor Booking Content
  const renderDoctorBookingContent = (booking) => {
    const badge = getBookingBadge(booking);
    
    return (
      <>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {/* Doctor Badge */}
            <div className={`inline-flex items-center ${badge.bg} ${badge.text} text-xs font-semibold px-2 py-1 rounded mb-2`}>
              {badge.icon}
              {badge.label}
            </div>
            
            <h3 className="font-bold text-gray-800 text-lg">
              {booking.type === "Online"
                ? "Doctor Online Consultation"
                : booking.type === "Offline"
                ? "Doctor Offline Consultation"
                : "Doctor Consultation"}
            </h3>
            
            {booking.doctor && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Doctor:</span> {booking.doctor.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Specialization:</span> {booking.doctor.specialization}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <span className="text-lg font-bold text-gray-800">
              ₹{booking.payableAmount || booking.totalPrice}
            </span>
            <p className="text-xs text-gray-500 mt-1">Consultation Fee</p>
          </div>
        </div>

        {/* Booking ID */}
        <p className="text-sm bg-gray-50 p-2 rounded mt-2">
          <span className="font-semibold">Booking ID:</span>{" "}
          <span className="font-mono">{booking.doctorConsultationBookingId || booking.bookingId}</span>
        </p>

        {/* Date & Time */}
        <div className="flex items-center mt-3 text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
          </svg>
          <span className="font-semibold mr-2">Date & Time:</span>
          {formatDateForDisplay(booking.date)} , {booking.timeSlot}
        </div>

        {booking.type === "Offline" && booking.doctor && booking.doctor.address && (
          <p className="text-sm mt-2 flex items-center">
            <span className="font-semibold mr-2">Clinic Address:</span>
            <span
              className="text-blue-700 cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => openGoogleMaps(booking.doctor.address)}
              title="Click to open in Google Maps"
            >
              <FaMapMarkerAlt className="inline-block mr-1" />
              {booking.doctor.address}
            </span>
          </p>
        )}
      </>
    );
  };

  // ✅ Determine Booking Type and Render Accordingly
  const renderBookingContent = (booking) => {
    const bookingType = getBookingType(booking);
    
    if (bookingType === 'package') {
      return renderPackageBookingContent(booking);
    } else if (bookingType === 'doctor') {
      return renderDoctorBookingContent(booking);
    } else {
      return renderDiagnosticBookingContent(booking);
    }
  };

  // ✅ Render Package Booking Details
  const renderPackageBookingDetails = (booking) => {
    const badge = getBookingBadge(booking);
    
    return (
      <>
        <div className="space-y-4 text-sm">
          {/* Package Badge */}
          <div className={`${badge.bg} border-l-4 ${badge.border} p-3`}>
            <div className="flex items-center">
              {badge.icon}
              <span className="font-bold ml-2">{badge.label}</span>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-800 text-lg mb-2">
              {booking.package?.name}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Total Tests</p>
                <p className="font-semibold text-blue-700">{booking.package?.totalTestsIncluded}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Service Type</p>
                <p className="font-semibold">{booking.serviceType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Original Price</p>
                <p className="font-semibold">₹{booking.package?.price}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Paid Amount</p>
                <p className="font-semibold text-green-700">₹{booking.payableAmount}</p>
              </div>
            </div>

            {/* Package Description */}
            {booking.package?.description && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700">{booking.package.description}</p>
              </div>
            )}
          </div>

          {/* Booking Info */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold">Booking ID</span>
              <span className="font-mono">{booking.diagnosticBookingId || booking.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Date & Time</span>
              <span>
                {formatDateForDisplay(booking.date)} - {booking.timeSlot}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Status</span>
              <span className={`font-semibold ${booking.status === 'Confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Staff Info */}
          {booking.staff && (
            <div className="bg-blue-50 p-3 rounded mt-3">
              <p className="text-xs text-gray-500 mb-1">Booked By</p>
              <p className="font-medium">{booking.staff.name}</p>
              <p className="text-sm text-gray-600">{booking.staff.email}</p>
            </div>
          )}
        </div>
      </>
    );
  };

  // ✅ Render Diagnostic/Xray/Test Booking Details
  const renderDiagnosticBookingDetails = (booking) => {
    const bookingType = getBookingType(booking);
    const badge = getBookingBadge(booking);
    
    return (
      <>
        <div className="space-y-4 text-sm">
          {/* Type Badge */}
          <div className={`${badge.bg} border-l-4 ${badge.border} p-3`}>
            <div className="flex items-center">
              {badge.icon}
              <span className="font-bold ml-2">{badge.label}</span>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold">Service Type</span>
              <span>
                {booking.serviceType === "Home Collection" 
                  ? "Home Collection" 
                  : "Center Visit"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Booking ID</span>
              <span className="font-mono">{booking.diagnosticBookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Date & Time</span>
              <span>
                {formatDateForDisplay(booking.date)} - {booking.timeSlot}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Total Amount</span>
              <span className="font-semibold text-green-700">₹{booking.payableAmount || booking.totalPrice}</span>
            </div>
          </div>

          {/* Diagnostic Center Info */}
          {booking.diagnostic && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Diagnostic Center</p>
              <p className="font-semibold">{booking.diagnostic.name}</p>
              
              {booking.serviceType === "Center Visit" && booking.diagnostic.address && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p 
                    className="text-sm text-blue-700 cursor-pointer hover:text-blue-500 transition-colors"
                    onClick={() => openGoogleMaps(booking.diagnostic.address)}
                  >
                    <FaMapMarkerAlt className="inline-block mr-1" />
                    {booking.diagnostic.address}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Items List */}
          {booking.cartItems && booking.cartItems.length > 0 && (
            <div className="bg-white border rounded-lg p-3">
              <p className="font-semibold mb-2">Booked Items</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {booking.cartItems.map((item, index) => (
                  <div key={index} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          {getItemTypeBadge(item)}
                          <span className="ml-2 font-medium">{item.title}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Quantity: {item.quantity}</div>
                          <div>Price: ₹{item.price}</div>
                          {item.offerPrice && item.offerPrice > 0 && (
                            <div>Offer: ₹{item.offerPrice}</div>
                          )}
                          <div>Total: ₹{item.totalPrice}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Total Summary */}
                <div className="pt-2 border-t mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Items:</span>
                    <span>{booking.cartItems.length}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-700">
                    <span>Total Amount:</span>
                    <span>₹{booking.payableAmount || booking.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  // ✅ Render Doctor Booking Details
  const renderDoctorBookingDetails = (booking) => {
    const badge = getBookingBadge(booking);
    
    return (
      <>
        <div className="space-y-4 text-sm">
          {/* Doctor Badge */}
          <div className={`${badge.bg} border-l-4 ${badge.border} p-3`}>
            <div className="flex items-center">
              {badge.icon}
              <span className="font-bold ml-2">{badge.label}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold">Consultation Type</span>
              <span>
                {booking.type === "Online"
                  ? "Online Consultation"
                  : "Clinic Visit"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Booking ID</span>
              <span className="font-mono">
                {booking.doctorConsultationBookingId || booking.bookingId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Date & Time</span>
              <span>
                {formatDateForDisplay(booking.date)} - {booking.timeSlot}
              </span>
            </div>
            {booking.patient && (
              <div className="flex justify-between">
                <span className="font-semibold">Family Member</span>
                <span>{booking.patient.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold">Consultation Fee</span>
              <span className="font-semibold text-green-700">₹{booking.payableAmount || booking.totalPrice}</span>
            </div>
          </div>

          {/* Doctor Details */}
          {booking.doctor && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Doctor Details</p>
              <p className="font-semibold">{booking.doctor.name}</p>
              <p className="text-sm text-gray-600">{booking.doctor.qualification}</p>
              <p className="text-sm text-gray-600">{booking.doctor.specialization}</p>
              
              {booking.type === "Offline" && booking.doctor.address && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Clinic Address</p>
                  <p 
                    className="text-sm text-blue-700 cursor-pointer hover:text-blue-500 transition-colors"
                    onClick={() => openGoogleMaps(booking.doctor.address)}
                  >
                    <FaMapMarkerAlt className="inline-block mr-1" />
                    {booking.doctor.address}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  // ✅ Render Booking Details Modal Content
  const renderBookingDetails = (booking) => {
    const bookingType = getBookingType(booking);
    
    if (bookingType === 'package') {
      return renderPackageBookingDetails(booking);
    } else if (bookingType === 'doctor') {
      return renderDoctorBookingDetails(booking);
    } else {
      return renderDiagnosticBookingDetails(booking);
    }
  };

  // ✅ USEEFFECT to sync refs with state
  useEffect(() => {
    selectedDateStringRef.current = selectedDateString;
  }, [selectedDateString]);
  
  useEffect(() => {
    selectedBookingRef.current = selectedBooking;
  }, [selectedBooking]);

  // ✅ UI Starts
  if (loading) {
    return (
      <div className="my-12 text-center text-lg">Loading your bookings...</div>
    );
  }

  if (error) {
    return (
      <div className="my-12 text-center text-lg text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchBookings}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="container mx-auto px-4 py-6">
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

          <h2 className="text-2xl font-bold mb-6 text-center">My bookings</h2>

          {/* ✅ FILTER SECTION */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
              >
                All Bookings
              </button>
              <button
                onClick={() => setFilter('package')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'package' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border'}`}
              >
                <span className="flex items-center">
                  <FaBox className="w-4 h-4 mr-1" />
                  Health Packages
                </span>
              </button>
              <button
                onClick={() => setFilter('doctor')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'doctor' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border'}`}
              >
                <FaStethoscope className="w-4 h-4 mr-1 inline" />
                Doctor
              </button>
              <button
                onClick={() => setFilter('xray')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'xray' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border'}`}
              >
                <FaXRay className="w-4 h-4 mr-1 inline" />
                X-Ray/Scan
              </button>
              <button
                onClick={() => setFilter('test')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'test' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
              >
                <FaFlask className="w-4 h-4 mr-1 inline" />
                Lab Tests
              </button>
            </div>

            {/* Active filter indicator */}
            <div className="text-sm text-gray-600 mb-2">
              Showing: {filter === 'all' ? 'All Bookings' : 
                       filter === 'package' ? 'Health Packages' : 
                       filter === 'doctor' ? 'Doctor Consultations' :
                       filter === 'xray' ? 'X-Ray/Scans' :
                       filter === 'test' ? 'Lab Tests' : 'Diagnostic'}
              <span className="ml-2 text-gray-400">
                ({filteredBookings.length} bookings)
              </span>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center text-lg text-gray-500">
              No bookings found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No {filter === 'all' ? '' : filter} bookings found</p>
                  {filter !== 'all' && (
                    <button
                      onClick={() => setFilter('all')}
                      className="mt-2 text-blue-600 text-sm underline"
                    >
                      View all bookings
                    </button>
                  )}
                </div>
              ) : (
                filteredBookings.map((booking) => {
                  const badge = getBookingBadge(booking);
                  const bookingType = getBookingType(booking);
                  
                  return (
                    <div
                      key={booking.bookingId || booking._id}
                      className={`bg-white rounded-lg shadow-md p-4 ${badge.border}`}
                    >
                      {renderBookingContent(booking)}
                      
                      <p className="text-sm mt-2">
                        <span className="font-semibold">Payment:</span>{" "}
                        ₹{booking.payableAmount || booking.totalPrice}
                      </p>

                      <div className="flex justify-between items-center mt-3">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-blue-600 text-sm font-medium flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                          Booking Details
                        </button>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`border px-3 py-1 rounded-full text-xs ${booking.status === "Cancelled"
                                ? "border-red-600 text-red-600"
                                : "border-green-600 text-green-600"
                              }`}
                          >
                            {booking.status}
                          </span>
                          
                          {/* Booking Type Badge */}
                          <span className={`px-2 py-1 ${badge.bg} ${badge.text} text-xs font-medium rounded-full flex items-center`}>
                            {badge.icon}
                            <span className="ml-1">
                              {bookingType === 'package' ? 'Package' :
                               bookingType === 'doctor' ? 'Doctor' :
                               bookingType === 'xray' ? 'X-Ray' :
                               bookingType === 'test' ? 'Test' : 'Diagnostic'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 🔹 Booking Details Modal - SMALLER SIZE */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-5 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  {(() => {
                    const bookingType = getBookingType(selectedBooking);
                    if (bookingType === 'package') return "Health Package Details";
                    if (bookingType === 'doctor') return "Doctor Consultation Details";
                    if (bookingType === 'xray') return "X-Ray/Scan Details";
                    if (bookingType === 'test') return "Lab Test Details";
                    return "Diagnostic Booking Details";
                  })()}
                </h3>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    selectedBookingRef.current = null;
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {renderBookingDetails(selectedBooking)}

              {/* ✅ MODIFIED BUTTONS SECTION: Hide both buttons if status is "Confirmed" */}
              <div className="mt-6 space-y-2">
                {selectedBooking.status !== "Cancelled" && selectedBooking.status !== "Confirmed" && (
                  <>
                    {/* Reschedule button only if status is NOT "Confirmed" (already handled by outer condition) */}
                    <button
                      onClick={() => handleRescheduleClick(selectedBooking)}
                      className="w-full border border-green-600 text-green-600 py-2 rounded-md text-sm font-medium hover:bg-green-50"
                    >
                      Reschedule Booking
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full border border-red-600 text-red-600 py-2 rounded-md text-sm font-medium hover:bg-red-50"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    selectedBookingRef.current = null;
                    setSelectedSlot("");
                    setAvailableSlots([]);
                    setSelectedDateString("");
                    selectedDateStringRef.current = "";
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔹 Cancel Confirmation Popup */}
        {showCancelConfirm && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-5 w-80 text-center">
              <h4 className="text-lg font-semibold mb-4">Cancel this booking?</h4>
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to cancel this booking? This action cannot
                be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    handleCancelBooking(selectedBooking);
                    setShowCancelConfirm(false);
                    setSelectedBooking(null);
                    selectedBookingRef.current = null;
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔹 Reschedule Modal - SMALLER SIZE */}
        {showReschedule && selectedBooking && (
          <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Reschedule Booking</h3>
                <button
                  onClick={() => {
                    setShowReschedule(false);
                    setSelectedSlot("");
                    setAvailableSlots([]);
                    setSelectedDateString("");
                    selectedDateStringRef.current = "";
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current Booking */}
              <div className="bg-blue-100 p-3 rounded-md mb-4">
                <p className="text-sm font-semibold">Current Booking</p>
                <p className="text-blue-700 font-medium text-sm">
                  {formatDateForDisplay(selectedBooking.date)} - {selectedBooking.timeSlot}
                </p>
              </div>

              {/* Dates Row (7 days) */}
              <div className="flex space-x-2 overflow-x-auto mb-4 pb-2">
                {generateDateOptions().map((date, i) => {
                  const dateString = formatDateForAPI(date);
                  const isSelected = selectedDateStringRef.current === dateString;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleDateSelect(date)}
                      className={`flex flex-col items-center min-w-[50px] px-2 py-2 rounded-md ${isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      <span className="text-xs font-medium">
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      <span className="text-base font-semibold">{date.getDate()}</span>
                      <span className="text-xs text-gray-500">
                        {date.getMonth() + 1}/{date.getFullYear()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Loading State */}
              {loadingSlots && (
                <div className="text-center py-3">
                  <p className="text-sm text-gray-500">Loading available slots...</p>
                </div>
              )}

              {/* Slots Grid */}
              {!loadingSlots && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Available Time Slots
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <button
                          key={slot._id || slot.timeSlot}
                          onClick={() => setSelectedSlot(slot.timeSlot)}
                          disabled={slot.isBooked}
                          className={`p-2 rounded-md text-xs transition-colors ${slot.isBooked
                              ? "bg-red-100 text-red-600 cursor-not-allowed"
                              : selectedSlot === slot.timeSlot
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                          <div className="font-medium">{slot.timeSlot}</div>
                          {slot.isBooked && (
                            <div className="text-xs mt-1 text-red-500">Booked</div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-3 text-sm text-gray-500">
                        No slots available for this date
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Slot Info */}
              {selectedSlot && (
                <div className="bg-green-100 p-2 rounded-md mb-4">
                  <p className="text-xs font-semibold">Selected Slot</p>
                  <p className="text-green-700 font-medium text-sm">
                    {selectedDateStringRef.current} - {selectedSlot}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowReschedule(false);
                    setSelectedSlot("");
                    setAvailableSlots([]);
                    setSelectedDateString("");
                    selectedDateStringRef.current = "";
                  }}
                  className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmReschedule}
                  disabled={!selectedSlot}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedSlot
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;