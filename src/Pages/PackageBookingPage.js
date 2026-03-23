import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { 
  X, Check, MapPin, Phone, Mail, Calendar, Clock, User, Home, Building, 
  Package, TestTube, Shield, ShoppingBag, ArrowLeft, DollarSign,
  PartyPopper, ExternalLink, CalendarDays, Clock3, MapPinHouse,
  AlertCircle, Info // ✅ Added for error modal
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const StaffPackageBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Existing states...
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);
  const [filteredDiagnostics, setFilteredDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "", city: "", state: "", country: "India", postalCode: "", addressType: "Home"
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [newFamilyMember, setNewFamilyMember] = useState({
    fullName: "", mobileNumber: "", age: "", gender: "", DOB: "", height: "", weight: "", relation: "", eyeSight: "", BP: "", BMI: ""
  });
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(30); // ✅ Countdown state

  // ✅ NEW STATES: Error modal for duplicate package booking
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const staffId = localStorage.getItem("staffId");
  const companyId = localStorage.getItem("companyId");
  const staff = JSON.parse(sessionStorage.getItem("staff"));

  // ✅ Countdown timer
  useEffect(() => {
    let timer;
    if (showSuccessModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setShowSuccessModal(false);
      navigate('/mybookings');
    }
    return () => clearInterval(timer);
  }, [showSuccessModal, countdown, navigate]);

  // ✅ Helper: Show modal + start countdown
  const showSuccessAndNavigate = () => {
    setCountdown(30); // Reset countdown to 30 seconds
    setShowSuccessModal(true);
  };

  // ✅ NEW FUNCTION: Handle duplicate package error
  const handleDuplicatePackageError = (errorData) => {
    console.log("Duplicate package error:", errorData);
    
    setBookingError({
      message: errorData.message || "You have already booked this package",
      existingBookingId: errorData.existingBookingId,
      bookingDetails: errorData.bookingDetails,
      suggestion: errorData.suggestion || "Please check your existing booking"
    });
    
    setShowErrorModal(true);
  };

  useEffect(() => {
    if (location.state) {
      setSelectedPackage({
        packageId: location.state.packageId,
        packageName: location.state.packageName,
        price: location.state.packagePrice,
        isPackageBooking: location.state.isPackageBooking
      });
    } else {
      navigate('/packages');
      return;
    }
    fetchCompanyDiagnostics();
    if (staffId) {
      fetchWalletData();
      fetchFamilyMembers();
      fetchAddresses();
      if (staff && staff._id) {
        setSelectedFamilyMember(staff._id);
      }
    }
  }, [location.state, staffId]);

  useEffect(() => {
    filterDiagnostics();
  }, [diagnostics]);

  const fetchCompanyDiagnostics = async () => {
    setLoading(true);
    setError("");
    if (!companyId || !staffId) {
      setError("Login data missing. Please login again.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `https://api.credenthealth.com/api/admin/allcompaniespackdiagnostics/${companyId}/${staffId}`
      );
      if (response.data && response.data.data) {
        const diagnosticsWithPackages = response.data.data.filter(
          diagnostic => diagnostic.packages && diagnostic.packages.length > 0
        );
        setDiagnostics(diagnosticsWithPackages);
        setFilteredDiagnostics(diagnosticsWithPackages);
        if (diagnosticsWithPackages.length === 0) {
          setError("No diagnostic centers with packages found for your company");
        }
      } else {
        setDiagnostics([]);
        setError("No diagnostics data received");
      }
    } catch (err) {
      console.error("❌ Error fetching company diagnostics:", err);
      setError("Failed to load diagnostics. Please try again.");
      setDiagnostics([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDiagnostics = () => {
    setFilteredDiagnostics(diagnostics);
  };

  const fetchFamilyMembers = async () => {
    try {
      const response = await axios.get(`https://api.credenthealth.com/api/staff/getallfamily/${staffId}`);
      setFamilyMembers(response.data.family_members || []);
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`https://api.credenthealth.com/api/staff/getaddresses/${staffId}`);
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchWalletData = async () => {
    try {
      const response = await axios.get(
        `https://api.credenthealth.com/api/staff/wallet/${staffId}`
      );
      setWalletData(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      return null;
    }
  };

  const fetchSlots = async (diagnosticId, date, type) => {
    setSlotLoading(true);
    setSlotError("");
    try {
      const response = await axios.get(
        `https://api.credenthealth.com/api/staff/diagnosticslots/${diagnosticId}?date=${date}&type=${type}`
      );
      if (response.data.slots && response.data.slots.length > 0) {
        setAvailableSlots(response.data.slots);
      } else {
        setAvailableSlots([]);
        setSlotError("No slots available for the selected date");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setSlotError("Error fetching available slots. Please try another date.");
      setAvailableSlots([]);
    } finally {
      setSlotLoading(false);
    }
  };

  const fetchAvailableDates = async (diagnosticId, option) => {
    try {
      const today = new Date();
      const dates = [];
      
      // कल से शुरू (i = 1)
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        try {
          const response = await axios.get(
            `https://api.credenthealth.com/api/staff/diagnosticslots/${diagnosticId}?date=${dateString}&type=${option}`
          );
          
          if (response.data.slots && response.data.slots.length > 0) {
            const availableSlots = response.data.slots.filter(slot => !slot.isBooked);
            if (availableSlots.length > 0) {
              dates.push(dateString);
            }
          }
        } catch (error) {
          continue;
        }
      }
      setAvailableDates(dates);
    } catch (error) {
      console.error("Error fetching available dates:", error);
      setAvailableDates([]);
    }
  };

  const handleDiagnosticSelect = (diagnostic) => {
    setSelectedDiagnostic(diagnostic);
    setShowBookingModal(true);
  };

  const handleServiceSelect = async (option) => {
    setSelectedOption(option);
    if (selectedDiagnostic && selectedDiagnostic._id) {
      await fetchAvailableDates(selectedDiagnostic._id, option);
    }
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    setAvailableSlots([]);
    if (selectedOption && selectedDiagnostic) {
      await fetchSlots(selectedDiagnostic._id, date, selectedOption);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleFamilyInputChange = (e) => {
    const { name, value } = e.target;
    setNewFamilyMember(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAddress = async () => {
    try {
      const response = await axios.post(
        `https://api.credenthealth.com/api/staff/create-address/${staffId}`,
        newAddress
      );
      if (response.data.success) {
        await fetchAddresses();
        setShowAddressForm(false);
        setNewAddress({ street: "", city: "", state: "", country: "India", postalCode: "", addressType: "Home" });
      }
    } catch (error) {
      console.error("Error creating address:", error);
    }
  };

  const handleAddFamilyMember = async () => {
    if (!staffId) return;
    try {
      const response = await axios.post(
        `https://api.credenthealth.com/api/staff/create-family/${staffId}`,
        newFamilyMember
      );
      alert("Family member added successfully");
      await fetchFamilyMembers();
      setNewFamilyMember({
        fullName: "", mobileNumber: "", age: "", gender: "", DOB: "", height: "", weight: "", relation: "", eyeSight: "", BP: "", BMI: ""
      });
      setShowFamilyForm(false);
    } catch (error) {
      console.error("Error adding family member:", error);
      alert("Error adding family member");
    }
  };

  const handleFamilyMemberSelect = (familyMemberId) => {
    setSelectedFamilyMember(familyMemberId);
  };

  const isBookDisabled = () => {
    if (!selectedOption || !selectedFamilyMember) return true;
    if (selectedOption === "Home Collection") {
      return !selectedAddress || !selectedDate || !selectedTime;
    } else if (selectedOption === "Center Visit") {
      return !selectedDate || !selectedTime;
    }
    return true;
  };

  // ✅ MODIFIED: handleConfirmBooking with duplicate package error handling
  const handleConfirmBooking = async () => {
    if (isBookDisabled()) {
      alert("Please fill all required fields");
      return;
    }
    setProcessingPayment(true);
    try {
      let walletDataToUse = walletData;
      if (!walletDataToUse) {
        walletDataToUse = await fetchWalletData();
      }
      const availableBalance = walletDataToUse?.forTests || 0;
      const packagePrice = selectedPackage.price || 0;

      if (availableBalance >= packagePrice) {
        const response = await axios.post(
          `https://api.credenthealth.com/api/staff/package-bookings/${staffId}`,
          {
            familyMemberId: selectedFamilyMember,
            diagnosticId: selectedDiagnostic._id,
            packageId: selectedPackage.packageId,
            serviceType: selectedOption,
            date: selectedDate,
            timeSlot: selectedTime,
            addressId: selectedOption === "Home Collection" ? selectedAddress : null,
            useWallet: true,
          }
        );
        if (response.data.isSuccessfull) {
          handlePopupClose();
          showSuccessAndNavigate();
        } else {
          // ✅ Check for duplicate package error
          if (response.data.existingBookingId) {
            handleDuplicatePackageError(response.data);
          } else {
            alert("Booking failed. Please try again.");
          }
        }
      } else {
        initializeRazorpayPayment(packagePrice, availableBalance);
      }
    } catch (error) {
      console.error("Error creating package booking:", error);
      
      // ✅ Handle duplicate package error from catch block
      if (error.response?.data?.existingBookingId) {
        handleDuplicatePackageError(error.response.data);
      } else {
        alert("Booking failed. Please try again.");
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ✅ MODIFIED: initializeRazorpayPayment with duplicate package error handling
  const initializeRazorpayPayment = async (totalPrice, walletBalanceUsed) => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Please check your connection.");
      return;
    }
    const options = {
      key: "rzp_test_BxtRNvflG06PTV",
      amount: totalPrice * 100,
      currency: "INR",
      name: "Credent Health",
      description: `Package Booking: ${selectedPackage.packageName}`,
      handler: async function (response) {
        const razorpayTransactionId = response.razorpay_payment_id;
        try {
          const bookingResponse = await axios.post(
            `https://api.credenthealth.com/api/staff/package-bookings/${staffId}`,
            {
              familyMemberId: selectedFamilyMember,
              diagnosticId: selectedDiagnostic._id,
              packageId: selectedPackage.packageId,
              serviceType: selectedOption,
              date: selectedDate,
              timeSlot: selectedTime,
              addressId: selectedOption === "Home Collection" ? selectedAddress : null,
              transactionId: razorpayTransactionId,
              walletAmount: walletBalanceUsed || 0,
            }
          );
          if (bookingResponse.data.isSuccessfull) {
            handlePopupClose();
            showSuccessAndNavigate();
          } else {
            // ✅ Check for duplicate package error
            if (bookingResponse.data.existingBookingId) {
              handleDuplicatePackageError(bookingResponse.data);
            } else {
              alert("Booking failed after payment. Please contact support.");
            }
          }
        } catch (error) {
          console.error("Error completing package booking:", error);
          
          // ✅ Handle duplicate package error from catch block
          if (error.response?.data?.existingBookingId) {
            handleDuplicatePackageError(error.response.data);
          } else {
            alert("Booking completion failed. Please contact support.");
          }
        }
      },
      prefill: {
        name: localStorage.getItem("staffName") || "Customer",
        email: localStorage.getItem("staffEmail") || "customer@example.com",
        contact: localStorage.getItem("staffPhone") || "9999999999",
      },
      theme: { color: "#3399cc" },
    };
    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };

  // ✅ NEW FUNCTION: Handle view existing bookings
  const handleViewExistingBookings = () => {
    setShowErrorModal(false);
    navigate('/mybookings');
  };

  const handlePopupClose = () => {
    setShowBookingModal(false);
    setSelectedDiagnostic(null);
    setSelectedOption("");
    setAvailableSlots([]);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedAddress("");
    setSelectedFamilyMember(staff?._id || "");
    setAvailableDates([]);
    setSlotError("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "";
    return timeString.replace(":00", "").replace(/(AM|PM)/, " $1");
  };

  const getDiagnosticColor = (centerType) => {
    switch(centerType?.toLowerCase()) {
      case 'hospital': return 'bg-red-50 border-red-200';
      case 'clinic': return 'bg-blue-50 border-blue-200';
      case 'lab': return 'bg-green-50 border-green-200';
      case 'diagnostic center': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getDiagnosticIcon = (centerType) => {
    switch(centerType?.toLowerCase()) {
      case 'hospital': return '🏥';
      case 'clinic': return '🏥';
      case 'lab': return '🧪';
      case 'diagnostic center': return '🏢';
      default: return '🏥';
    }
  };

  if (!selectedPackage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No package selected</p>
          <button
            onClick={() => navigate('/packages')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back to Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full">
              <button
                onClick={() => navigate('/packages')}
                className="flex items-center text-white/80 hover:text-white mb-4 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Back to Packages
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Book Your Package</h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/20 px-3 py-2 sm:px-4 sm:py-2 rounded-lg max-w-full">
                  <h2 className="text-lg sm:text-xl font-semibold truncate">{selectedPackage.packageName}</h2>
                </div>
                <div className="bg-white/20 px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center">
                  <span className="text-base sm:text-lg">₹{selectedPackage.price}</span>
                </div>
                {selectedPackage.isPackageBooking && (
                  <div className="bg-green-500/20 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
                    Package Booking
                  </div>
                )}
              </div>
            </div>
            <div className="hidden sm:block bg-white/20 p-4 rounded-xl">
              <ShoppingBag className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-gray-50 py-8 md:py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Select Diagnostic Center
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Choose where you want to book "{selectedPackage.packageName}"
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading diagnostic centers...</p>
            </div>
          ) : filteredDiagnostics.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-gray-600 text-lg">No diagnostic centers available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredDiagnostics.map((diagnostic) => (
                <div key={diagnostic._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-lg sm:hover:shadow-2xl transition-all duration-300 sm:hover:-translate-y-1 group">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                        {diagnostic.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${diagnostic.centerType?.toLowerCase() === 'hospital' ? 'bg-red-100 text-red-800' : 
                          diagnostic.centerType?.toLowerCase() === 'clinic' ? 'bg-blue-100 text-blue-800' : 
                          diagnostic.centerType?.toLowerCase() === 'lab' ? 'bg-green-100 text-green-800' : 
                          'bg-purple-100 text-purple-800'}`}>
                          {diagnostic.centerType || "Diagnostic"}
                        </span>
                        <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{diagnostic.city || diagnostic.address?.split(",")[0]}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${getDiagnosticColor(diagnostic.centerType)} ml-2`}>
                      <span className="text-lg sm:text-xl">{getDiagnosticIcon(diagnostic.centerType)}</span>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="truncate">{diagnostic.phone || 'Contact not available'}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="truncate">{diagnostic.email || 'Email not available'}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="line-clamp-2">{diagnostic.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                      <span className="text-xs sm:text-sm text-green-600">Approved</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDiagnosticSelect(diagnostic)}
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-900 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                  >
                    Select This Center
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ NEW: DUPLICATE PACKAGE ERROR MODAL */}
      {showErrorModal && bookingError && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-amber-500 p-5 sm:p-6">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <AlertCircle className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Package Already Booked</h3>
                  <p className="text-red-100 text-sm mt-1">Cannot book same package multiple times</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6">
              {/* Error Message */}
              <div className="mb-5">
                <p className="text-gray-800 font-medium mb-3">{bookingError.message}</p>
                
                {/* Package Info */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Package className="w-4 h-4 text-blue-600 mr-2" />
                    Package: {selectedPackage?.packageName}
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="font-bold text-green-600">₹{selectedPackage?.price || 0}</span>
                  </div>
                </div>

                {/* Existing Booking Details */}
                {bookingError.existingBookingId && (
                  <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 text-amber-600 mr-2" />
                      Existing Booking Details
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Booking ID:</span>
                        <span className="font-medium text-blue-700">{bookingError.existingBookingId}</span>
                      </div>
                      {bookingError.bookingDetails?.date && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Booking Date:</span>
                          <span className="font-medium">{new Date(bookingError.bookingDetails.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                        </div>
                      )}
                      {bookingError.bookingDetails?.status && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`font-medium ${bookingError.bookingDetails.status === 'Confirmed' ? 'text-green-600' : 'text-amber-600'}`}>
                            {bookingError.bookingDetails.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {bookingError.suggestion && (
                  <div className="flex items-start bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{bookingError.suggestion}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <button
                  onClick={handleViewExistingBookings}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center text-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Bookings
                </button>
                
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all duration-300 flex items-center justify-center text-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                <div className="flex items-center text-gray-600 text-sm">
                  <Info className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                  <p>Note: You cannot book the same health package that you have already booked in an active booking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedPackage && selectedDiagnostic && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-start sm:items-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mt-4 sm:mt-0">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 truncate">
                    Complete Booking for {selectedPackage.packageName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <span className="text-gray-600 text-sm sm:text-base truncate">{selectedDiagnostic.name}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {selectedDiagnostic.centerType || "Diagnostic Center"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handlePopupClose}
                  className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors ml-2 flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {/* Package Summary */}
              <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-2 truncate">{selectedPackage.packageName}</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center">
                        <TestTube className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mr-1 sm:mr-2" />
                        <span className="text-xs sm:text-sm text-gray-700">Health Package</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1 sm:mr-2" />
                        <span className="text-base sm:text-lg font-bold text-green-600">₹{selectedPackage.price || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0 sm:ml-4">
                    <div className="bg-white px-2 py-1 sm:px-3 sm:py-1 rounded-lg shadow inline-block">
                      <span className="text-xs sm:text-sm font-medium text-blue-600">Package Booking</span>
                    </div>
                  </div>
                </div>
              </div>

              {!selectedOption && (
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Select Service Type</h4>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <button
                      onClick={() => handleServiceSelect("Home Collection")}
                      className="p-4 sm:p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-100 rounded-xl flex items-center transition-all duration-300 hover:from-green-100 hover:to-emerald-100 hover:border-green-200 hover:shadow-lg group"
                    >
                      <div className="bg-green-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:bg-green-200 transition-colors flex-shrink-0">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-green-700 truncate">Home Collection</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Sample collection at your doorsteps</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleServiceSelect("Center Visit")}
                      className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl flex items-center transition-all duration-300 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-200 hover:shadow-lg group"
                    >
                      <div className="bg-blue-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                        <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-700 truncate">Center Visit</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Visit our diagnostic center</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {selectedOption && (
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Choose Date</h4>
                  {availableDates.length > 0 ? (
                    <div className="flex overflow-x-auto pb-2 space-x-2 sm:flex-wrap sm:gap-3">
                      {availableDates.slice(0, 5).map((date, index) => (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(date)}
                          className={`flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-xl text-xs sm:text-sm relative transition-all duration-300 flex-shrink-0 ${selectedDate === date
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md border border-gray-200'
                            }`}
                        >
                          {selectedDate === date && (
                            <span className="absolute -top-1 -right-1 bg-white border border-blue-500 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg">
                              <Check size={10} className="text-blue-600" strokeWidth={3} />
                            </span>
                          )}
                          <span className="text-xs font-medium opacity-80">{formatDate(date).split(' ')[0]}</span>
                          <span className="text-xl sm:text-2xl font-bold mt-1">{formatDate(date).split(' ')[1]}</span>
                          <span className="text-xs font-medium opacity-80 mt-1">{formatDate(date).split(' ')[2]}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-xl">
                      <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-gray-600 text-sm sm:text-base">No available dates found.</p>
                    </div>
                  )}
                </div>
              )}

              {selectedDate && selectedOption && (
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Choose Time Slot</h4>
                  {slotLoading && (
                    <div className="text-center py-4 sm:py-6">
                      <div className="inline-block animate-spin rounded-full h-6 h-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-2 sm:mt-3 text-gray-600 text-sm sm:text-base">Loading available slots...</p>
                    </div>
                  )}
                  {!slotLoading && availableSlots.length > 0 && (
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {availableSlots.slice(0, 8).map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleTimeSelect(slot.timeSlot)}
                          className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-300 flex-shrink-0 ${selectedTime === slot.timeSlot
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500 shadow-lg transform scale-105'
                              : slot.isBooked
                              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-md'
                            }`}
                          disabled={slot.isBooked}
                        >
                          {formatTimeDisplay(slot.timeSlot)}
                          {slot.isBooked && " (Booked)"}
                        </button>
                      ))}
                    </div>
                  )}
                  {!slotLoading && availableSlots.length === 0 && !slotError && selectedDate && (
                    <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-xl">
                      <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-gray-600 text-sm sm:text-base">No available time slots.</p>
                    </div>
                  )}
                </div>
              )}

              {selectedDate && selectedTime && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800">Select Patient</h4>
                    </div>
                    <button
                      onClick={() => setShowFamilyForm(true)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center self-start"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Family
                    </button>
                  </div>
                  <div className="grid gap-2 sm:gap-3 max-h-48 sm:max-h-64 overflow-y-auto pr-1 sm:pr-2">
                    {staff && staff._id && (
                      <label
                        className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex justify-between items-center ${selectedFamilyMember === staff._id
                          ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{staff.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Self • {staff.age || "N/A"} yrs • {staff.gender || "N/A"}</p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="selectedFamilyMember"
                          value={staff._id}
                          checked={selectedFamilyMember === staff._id}
                          onChange={() => handleFamilyMemberSelect(staff._id)}
                          className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 ml-2"
                        />
                      </label>
                    )}
                    {familyMembers.map((member) => (
                      <label
                        key={member._id}
                        className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex justify-between items-center ${selectedFamilyMember === member._id
                          ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{member.fullName}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                              {member.relation} • {member.age} yrs • {member.gender}
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="selectedFamilyMember"
                          value={member._id}
                          checked={selectedFamilyMember === member._id}
                          onChange={() => handleFamilyMemberSelect(member._id)}
                          className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 ml-2"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedOption === "Home Collection" && selectedDate && selectedTime && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800">Select Address</h4>
                    </div>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center self-start"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add New
                    </button>
                  </div>
                  {addresses.length > 0 ? (
                    <div className="grid gap-2 sm:gap-3 max-h-40 sm:max-h-48 overflow-y-auto pr-1 sm:pr-2">
                      {addresses.map((address) => (
                        <label
                          key={address._id}
                          className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col ${selectedAddress === address._id
                            ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center min-w-0">
                              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 ${address.addressType === 'Home' ? 'bg-blue-100' :
                                address.addressType === 'Work' ? 'bg-green-100' : 'bg-purple-100'
                                }`}>
                                {address.addressType === 'Home' ? (
                                  <Home className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                ) : address.addressType === 'Work' ? (
                                  <Building className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                ) : (
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{address.addressType}</h4>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                                  {address.street}, {address.city}
                                </p>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="selectedAddress"
                              value={address._id}
                              checked={selectedAddress === address._id}
                              onChange={() => setSelectedAddress(address._id)}
                              className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 ml-2"
                            />
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-xl">
                      <Home className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-3">No addresses found.</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedDate && selectedTime && selectedFamilyMember && (selectedOption !== "Home Collection" || selectedAddress) && (
                <div className="pt-4 sm:pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="mb-3 sm:mb-0">
                      <p className="text-xs sm:text-sm text-gray-600">Package Total:</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">₹{selectedPackage.price || 0}</p>
                      {walletData && (
                        <p className="text-xs sm:text-sm text-blue-600 mt-0.5">
                          Wallet Balance: ₹{walletData.forTests || 0}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={processingPayment || isBookDisabled()}
                      className={`px-6 py-2.5 sm:px-8 sm:py-3.5 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center ${processingPayment || isBookDisabled()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        } text-sm sm:text-base`}
                    >
                      {processingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-fadeIn">
            <div className="bg-green-500 p-5 rounded-t-2xl text-center">
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-3">
                <Check className="w-8 h-8 text-green-500" strokeWidth={3} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Booking Confirmed!</h3>
              <p className="text-green-100 text-sm">Your package has been booked successfully</p>
            </div>

            <div className="p-5">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 truncate">{selectedPackage?.packageName}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Package Price:</span>
                  <span className="font-bold text-green-600">₹{selectedPackage?.price || 0}</span>
                </div>
              </div>

              <div className="mb-4 text-center">
                <div className="inline-flex items-center px-3 py-1 bg-amber-50 rounded-full">
                  <Clock3 className="w-3 h-3 text-amber-600 mr-1" />
                  <span className="text-xs text-amber-700">
                    Redirecting in <span className="font-bold">{countdown}</span>s
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/mybookings');
                }}
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-start sm:items-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl w-full max-w-md shadow-2xl mt-4 sm:mt-0 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-3 sm:mb-4">
                <Home className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Add New Address</h3>
              <p className="text-gray-600 text-sm sm:text-base">Enter your address details</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Address Type</label>
                <select
                  name="addressType"
                  value={newAddress.addressType}
                  onChange={handleAddressInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                >
                  <option value="Home">🏠 Home</option>
                  <option value="Work">🏢 Work</option>
                  <option value="Other">📍 Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={newAddress.street}
                  onChange={handleAddressInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  placeholder="Enter street address"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    placeholder="Enter state"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={newAddress.postalCode}
                    onChange={handleAddressInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    placeholder="Enter postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={newAddress.country}
                    onChange={handleAddressInputChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    placeholder="Enter country"
                    defaultValue="India"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddressForm(false)}
                className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAddress}
                className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Family Member Form Modal */}
      {showFamilyForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-start sm:items-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto mt-4 sm:mt-0">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-3 sm:mb-4">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Add Family Member</h2>
              <p className="text-gray-600 text-sm sm:text-base">Enter family member details</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={newFamilyMember.fullName}
                onChange={handleFamilyInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
              />
              <input
                type="text"
                name="mobileNumber"
                placeholder="Mobile Number"
                value={newFamilyMember.mobileNumber}
                onChange={handleFamilyInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
              />
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={newFamilyMember.age}
                  onChange={handleFamilyInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                />
                <select
                  name="gender"
                  value={newFamilyMember.gender}
                  onChange={handleFamilyInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="DOB" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="DOB"
                  name="DOB"
                  value={newFamilyMember.DOB}
                  onChange={handleFamilyInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="number"
                  name="height"
                  placeholder="Height (cm)"
                  value={newFamilyMember.height}
                  onChange={handleFamilyInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                />
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (kg)"
                  value={newFamilyMember.weight}
                  onChange={handleFamilyInputChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <input
                  type="text"
                  name="eyeSight"
                  value={newFamilyMember.eyeSight}
                  onChange={handleFamilyInputChange}
                  placeholder="Eye Sight"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs sm:text-sm"
                />
                <input
                  type="number"
                  name="BMI"
                  value={newFamilyMember.BMI}
                  onChange={handleFamilyInputChange}
                  placeholder="BMI"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs sm:text-sm"
                />
                <input
                  type="text"
                  name="BP"
                  value={newFamilyMember.BP}
                  onChange={handleFamilyInputChange}
                  placeholder="BP"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs sm:text-sm"
                />
              </div>
              <select
                name="relation"
                value={newFamilyMember.relation}
                onChange={handleFamilyInputChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
              >
                <option value="">Select Relation</option>
                <option value="Spouse">Spouse</option>
                <option value="Wife">Wife</option>
                <option value="Husband">Husband</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={() => setShowFamilyForm(false)}
                className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFamilyMember}
                className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StaffPackageBookingPage;