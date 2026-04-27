import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { X, Check, MapPin, Phone, Mail, Calendar, Clock, User, Home, Building, Plus, Trash2, TestTube, Package, Scan, ArrowLeft, Clock3, AlertCircle, Info, Eye } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const DiagnosticsPage = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [filteredDiagnostics, setFilteredDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    addressType: "Home"
  });

  const [processingPayment, setProcessingPayment] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [showAllDates, setShowAllDates] = useState(false);
  const [showAllSlots, setShowAllSlots] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [fromCart, setFromCart] = useState(false);
  const [cartDiagnosticIds, setCartDiagnosticIds] = useState([]);
  
  const [newFamilyMember, setNewFamilyMember] = useState({
    fullName: "",
    mobileNumber: "",
    age: "",
    gender: "",
    DOB: "",
    height: "",
    weight: "",
    relation: "",
    eyeSight: "",
    BP: "",
    BMI: ""
  });
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsType, setSelectedDetailsType] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState([]);

  // ✅ New states for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // ✅ NEW STATES: Error modal for duplicate items
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [duplicateItems, setDuplicateItems] = useState([]);

  // ✅ NEW STATE: For same date/time slot validation
  const [showSameSlotModal, setShowSameSlotModal] = useState(false);
  const [sameSlotError, setSameSlotError] = useState("");

  // ✅ NEW STATE: Booking preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBooking, setPreviewBooking] = useState(null);

  // ✅ NEW STATE: Insufficient balance modal
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [insufficientBalanceData, setInsufficientBalanceData] = useState({
    requiredOnline: 0,
    walletAvailable: 0,
    totalPrice: 0
  });

  const staffId = localStorage.getItem("staffId");
  const companyId = localStorage.getItem("companyId");
  const staff = JSON.parse(sessionStorage.getItem("staff"));
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Countdown timer for success modal
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

  // ✅ Helper: Show success modal
  const showSuccessAndNavigate = (data) => {
    setBookingSuccessData(data);
    setCountdown(30);
    setShowSuccessModal(true);
  };

  useEffect(() => {
    console.log("Location state:", location.state);
    
    if (location.state) {
      if (location.state.cartItems) {
        setFromCart(true);
        setCartItems(location.state.cartItems);
      }
      if (location.state.diagnosticIds) {
        setCartDiagnosticIds(location.state.diagnosticIds);
      }
    }
    
    fetchCompanyDiagnostics();
    
    if (staffId) {
      fetchWalletData();
      fetchFamilyMembers();
      if (staff && staff._id) {
        setSelectedFamilyMember(staff._id);
      }
    }
  }, [staffId, location.state]);

  const findMatchingDiagnostics = (allDiagnostics) => {
    if (!fromCart || cartItems.length === 0) {
      setFilteredDiagnostics(allDiagnostics);
      return;
    }
    
    console.log("Finding matching diagnostics for cart items:", cartItems);
    
    const cartItemIds = cartItems.map(item => item.itemId);
    console.log("Cart Item IDs:", cartItemIds);
    
    const matchingCenters = [];
    
    allDiagnostics.forEach(diagnostic => {
      let hasMatchingItems = false;
      
      // Check tests
      if (diagnostic.tests && Array.isArray(diagnostic.tests)) {
        hasMatchingItems = diagnostic.tests.some(test => 
          cartItemIds.includes(test._id)
        );
      }
      
      // Check scans
      if (!hasMatchingItems && diagnostic.scans && Array.isArray(diagnostic.scans)) {
        hasMatchingItems = diagnostic.scans.some(scan => 
          cartItemIds.includes(scan._id)
        );
      }
      
      // Check packages
      if (!hasMatchingItems && diagnostic.packages && Array.isArray(diagnostic.packages)) {
        hasMatchingItems = diagnostic.packages.some(pkg => 
          cartItemIds.includes(pkg._id)
        );
      }
      
      // If has matching items, include in filtered list
      if (hasMatchingItems) {
        matchingCenters.push(diagnostic);
      }
    });
    
    console.log("Matching diagnostics found:", matchingCenters.length);
    setFilteredDiagnostics(matchingCenters);
  };

 const fetchCompanyDiagnostics = async () => {
  setLoading(true);
  setError("");
  
  if (!companyId) {
    setError("Company ID not found. Please login again.");
    setLoading(false);
    return;
  }
  
  // ✅ Staff ID get karein
  const staffId = localStorage.getItem("staffId");
  
  // ✅ Dono IDs required hain
  if (!staffId) {
    setError("Staff ID not found. Please login again.");
    setLoading(false);
    return;
  }
  
  console.log("🔍 API Call Parameters:", { companyId, staffId });
  
  try {
    // ✅ New API with both companyId and staffId
    const response = await axios.get(
      `https://api.elthiumhealth.com/api/admin/allcompaniesdiagnostics/${companyId}/${staffId}`
    );
    
    console.log("✅ API Response:", response.data);
    
    if (response.data && response.data.data) {
      const transformedDiagnostics = response.data.data.map(diagnostic => {
        let tests = [];
        let packages = [];
        let scans = [];
        
        if (Array.isArray(diagnostic.tests)) {
          tests = diagnostic.tests;
        }
        
        if (Array.isArray(diagnostic.packages)) {
          packages = diagnostic.packages;
        }
        
        if (Array.isArray(diagnostic.scans)) {
          scans = diagnostic.scans;
        }
        
        return {
          ...diagnostic,
          tests: tests,
          packages: packages,
          scans: scans,
          matchesCart: diagnostic.matchesCart || false,
          matchedItemCount: diagnostic.matchedItemCount || 0
        };
      });
      
      setDiagnostics(transformedDiagnostics);
      findMatchingDiagnostics(transformedDiagnostics);
      
      // ✅ Cart info display karein
      if (response.data.cartInfo) {
        console.log("🛒 Cart Information:", response.data.cartInfo);
        
        // Optional: User ko cart info show karein
        if (response.data.cartInfo.hasCart) {
          console.log(`User ke cart mein ${response.data.cartInfo.cartItemCount} items hain`);
        }
      }
    } else {
      setDiagnostics([]);
      setFilteredDiagnostics([]);
      setError("No diagnostics found for your company");
    }
    setLoading(false);
  } catch (err) {
    console.error("❌ Error fetching company diagnostics:", err);
    
    // ✅ Detailed error logging
    if (err.response) {
      console.error("Error Status:", err.response.status);
      console.error("Error Data:", err.response.data);
      console.error("Error Headers:", err.response.headers);
      
      // ✅ Specific error messages
      if (err.response.status === 400) {
        if (err.response.data?.message?.includes("staffId")) {
          setError("Staff ID is required. Please login again.");
        } else if (err.response.data?.message?.includes("companyId")) {
          setError("Company ID is required. Please login again.");
        } else {
          setError(err.response.data?.message || "Bad request");
        }
      } else if (err.response.status === 404) {
        setError("API endpoint not found. Please check backend routes.");
      } else if (err.response.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(`Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      }
    } else if (err.request) {
      // ✅ Network error
      console.error("Network Error:", err.request);
      setError("Network error. Please check your internet connection.");
    } else {
      // ✅ Setup error
      console.error("Setup Error:", err.message);
      setError("Error setting up request.");
    }
    
    setLoading(false);
  }
};

  const handleDetailsClick = (diagnostic, type) => {
    setSelectedDiagnostic(diagnostic);
    setSelectedDetailsType(type);
    setShowDetailsModal(true);
    
    setDetailsLoading(true);
    
    setTimeout(() => {
      let data = [];
      
      switch(type) {
        case 'tests':
          data = diagnostic.tests || [];
          break;
        case 'packages':
          data = diagnostic.packages || [];
          break;
        case 'scans':
          data = diagnostic.scans || [];
          break;
        default:
          data = [];
      }
      
      setDetailsData(data);
      setDetailsLoading(false);
    }, 300);
  };

  const checkDiagnosticHasCartItems = (diagnostic) => {
    if (!fromCart || cartItems.length === 0) return false;
    
    const cartItemIds = cartItems.map(item => item.itemId);
    let hasCartItems = false;
    
    if (diagnostic.tests && Array.isArray(diagnostic.tests)) {
      hasCartItems = diagnostic.tests.some(test => 
        cartItemIds.includes(test._id)
      );
    }
    
    if (!hasCartItems && diagnostic.scans && Array.isArray(diagnostic.scans)) {
      hasCartItems = diagnostic.scans.some(scan => 
        cartItemIds.includes(scan._id)
      );
    }
    
    if (!hasCartItems && diagnostic.packages && Array.isArray(diagnostic.packages)) {
      hasCartItems = diagnostic.packages.some(pkg => 
        cartItemIds.includes(pkg._id)
      );
    }
    
    return hasCartItems;
  };

  const getCartItemsInDiagnostic = (diagnostic) => {
    if (!fromCart || cartItems.length === 0) return [];
    
    const cartItemIds = cartItems.map(item => item.itemId);
    const itemsInThisDiagnostic = [];
    
    if (diagnostic.tests && Array.isArray(diagnostic.tests)) {
      diagnostic.tests.forEach(test => {
        if (cartItemIds.includes(test._id)) {
          const cartItem = cartItems.find(item => item.itemId === test._id);
          if (cartItem) {
            itemsInThisDiagnostic.push({
              ...cartItem,
              type: 'test'
            });
          }
        }
      });
    }
    
    if (diagnostic.scans && Array.isArray(diagnostic.scans)) {
      diagnostic.scans.forEach(scan => {
        if (cartItemIds.includes(scan._id)) {
          const cartItem = cartItems.find(item => item.itemId === scan._id);
          if (cartItem) {
            itemsInThisDiagnostic.push({
              ...cartItem,
              type: 'scan'
            });
          }
        }
      });
    }
    
    if (diagnostic.packages && Array.isArray(diagnostic.packages)) {
      diagnostic.packages.forEach(pkg => {
        if (cartItemIds.includes(pkg._id)) {
          const cartItem = cartItems.find(item => item.itemId === pkg._id);
          if (cartItem) {
            itemsInThisDiagnostic.push({
              ...cartItem,
              type: 'package'
            });
          }
        }
      });
    }
    
    return itemsInThisDiagnostic;
  };

  // ✅ NEW FUNCTION: Check if same date and time slot already exists in bookings
  const checkSameDateSlotExists = (diagnosticId, date, timeSlot) => {
    return bookings.some(booking => 
      booking.diagnostic._id !== diagnosticId && 
      booking.date === date && 
      booking.timeSlot === timeSlot
    );
  };

  // ✅ MODIFIED: addToBookings with preview
  const addToBookings = () => {
    if (!selectedDiagnostic || !selectedOption || !selectedDate || !selectedTime || !selectedFamilyMember) {
      alert("Please fill all required fields");
      return;
    }

    // ✅ NEW: Check if same date and time slot already exists for another diagnostic
    if (checkSameDateSlotExists(selectedDiagnostic._id, selectedDate, selectedTime)) {
      setSameSlotError(`You already have another diagnostic booked on ${formatDate(selectedDate)} at ${formatTimeDisplay(selectedTime)}. Please choose a different date or time slot.`);
      setShowSameSlotModal(true);
      return;
    }

    const newBooking = {
      id: Date.now().toString(),
      diagnostic: selectedDiagnostic,
      serviceType: selectedOption,
      date: selectedDate,
      timeSlot: selectedTime,
      addressId: selectedOption === "Home Collection" ? selectedAddress : null,
      familyMemberId: selectedFamilyMember,
      price: selectedDiagnostic.price || 0
    };

    // Show preview modal instead of directly adding
    setPreviewBooking(newBooking);
    setShowPreviewModal(true);
  };

  // ✅ NEW FUNCTION: Confirm booking after preview
  const confirmAddToBookings = () => {
    if (!previewBooking) return;
    
    setBookings(prev => [...prev, previewBooking]);
    
    setSelectedDate("");
    setSelectedTime("");
    setSelectedAddress("");
    setAvailableSlots([]);
    setAvailableDates([]);
    
    setShowPreviewModal(false);
    setPreviewBooking(null);
    
    // Optional: Show success message
    alert(`✅ ${previewBooking.diagnostic.name} Diagnostics selected successfully. Add more diagnostics if required`);
  };

  const removeBooking = (bookingId) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  const calculateTotalPrice = () => {
    return bookings.reduce((total, booking) => total + (booking.price || 0), 0);
  };

  // ✅ NEW FUNCTION: Handle duplicate items error
  const handleDuplicateItemsError = (errorData) => {
    console.log("Duplicate items error:", errorData);
    
    setBookingError({
      message: errorData.message || "You have already booked some items",
      duplicateItems: errorData.duplicateItems || [],
      suggestion: errorData.suggestion || "Please remove these items from your cart"
    });
    
    setDuplicateItems(errorData.duplicateItems || []);
    setShowErrorModal(true);
  };

  // ✅ MODIFIED: handleMultipleBookings with proper wallet balance check and Razorpay trigger
  const handleMultipleBookings = async () => {
    if (bookings.length === 0) {
      alert("Please add at least one booking");
      return;
    }

    setProcessingPayment(true);

    try {
      // Fetch latest wallet data
      let walletDataToUse = walletData;
      if (!walletDataToUse) {
        walletDataToUse = await fetchWalletData();
      }

      const availableBalance = walletDataToUse?.forTests || 0;
      const totalPrice = calculateTotalPrice();

      console.log("💰 Wallet Balance:", availableBalance);
      console.log("💰 Total Price:", totalPrice);

      if (availableBalance >= totalPrice) {
        // Sufficient wallet balance - proceed with wallet payment
        console.log("✅ Sufficient balance, proceeding with wallet payment");
        
        const bookingPromises = bookings.map(booking => 
          axios.post(
            `https://api.elthiumhealth.com/api/staff/create-bookings/${staffId}`,
            {
              familyMemberId: booking.familyMemberId,
              diagnosticId: booking.diagnostic._id,
              serviceType: booking.serviceType,
              date: booking.date,
              timeSlot: booking.timeSlot,
              addressId: booking.addressId,
              useWallet: true,
            }
          )
        );

        const responses = await Promise.all(bookingPromises);
        const allSuccessful = responses.every(response => response.data.isSuccessfull);

        if (allSuccessful) {
          // ✅ Use success modal
          showSuccessAndNavigate({
            type: 'multiple',
            count: bookings.length,
            totalPrice: totalPrice,
            diagnostics: bookings.map(b => b.diagnostic.name)
          });
          setBookings([]);
          handlePopupClose();
        } else {
          // Check for insufficient balance response
          const failedResponse = responses.find(r => !r.data.isSuccessfull);
          if (failedResponse?.data?.message?.includes("Insufficient wallet balance")) {
            // Show insufficient balance modal and trigger Razorpay
            setInsufficientBalanceData({
              requiredOnline: failedResponse.data.requiredOnline || totalPrice,
              walletAvailable: failedResponse.data.walletAvailable || availableBalance,
              totalPrice: totalPrice
            });
            setShowInsufficientBalanceModal(true);
          } else if (failedResponse?.data?.duplicateItems) {
            handleDuplicateItemsError(failedResponse.data);
          } else {
            alert("Some bookings failed. Please check your bookings.");
          }
        }
      } else {
        // Insufficient wallet balance - show modal and trigger Razorpay
        console.log("❌ Insufficient balance, triggering Razorpay");
        setInsufficientBalanceData({
          requiredOnline: totalPrice - availableBalance,
          walletAvailable: availableBalance,
          totalPrice: totalPrice
        });
        setShowInsufficientBalanceModal(true);
      }
    } catch (error) {
      console.error("Error creating multiple bookings:", error);
      
      // Check for insufficient balance error in catch
      if (error.response?.data?.message?.includes("Insufficient wallet balance")) {
        setInsufficientBalanceData({
          requiredOnline: error.response.data.requiredOnline || calculateTotalPrice(),
          walletAvailable: error.response.data.walletAvailable || 0,
          totalPrice: calculateTotalPrice()
        });
        setShowInsufficientBalanceModal(true);
      } else if (error.response?.data?.duplicateItems) {
        handleDuplicateItemsError(error.response.data);
      } else {
        alert("Booking failed. Please try again.");
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  // ✅ NEW FUNCTION: Handle online payment for insufficient balance
  const handleOnlinePayment = async () => {
    setShowInsufficientBalanceModal(false);
    setProcessingPayment(true);
    
    const totalPrice = calculateTotalPrice();
    const walletAvailable = insufficientBalanceData.walletAvailable;
    
    await initializeRazorpayMultiplePayment(totalPrice, walletAvailable);
    
    setProcessingPayment(false);
  };

  const fetchFamilyMembers = async () => {
    try {
      const response = await axios.get(`https://api.elthiumhealth.com/api/staff/getallfamily/${staffId}`);
      setFamilyMembers(response.data.family_members || []);
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`https://api.elthiumhealth.com/api/staff/getaddresses/${staffId}`);
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchSlots = async (diagnosticId, date, type) => {
    setSlotLoading(true);
    setSlotError("");
    try {
      const response = await axios.get(
        `https://api.elthiumhealth.com/api/staff/diagnosticslots/${diagnosticId}?date=${date}&type=${type}`
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

  // ✅ FIXED: Start from tomorrow (i = 1)
  const fetchAvailableDates = async (diagnosticId, option) => {
    try {
      const today = new Date();
      const dates = [];
      
      // ✅ i = 1 se shuru - kal se (aaj nahi)
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        try {
          const response = await axios.get(
            `https://api.elthiumhealth.com/api/staff/diagnosticslots/${diagnosticId}?date=${dateString}&type=${option}`
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

  const handlePopupClose = () => {
    setShowServiceModal(false);
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
    setShowAllSlots(false);
    setShowAllDates(false);
  };

  const handleDiagnosticClick = (diagnostic) => {
    setSelectedDiagnostic(diagnostic);
    setShowServiceModal(true);
  };

  const handleServiceSelect = async (option) => {
    setSelectedOption(option);
    await fetchAddresses();
    setShowServiceModal(false);
    setShowBookingModal(true);

    if (selectedDiagnostic && selectedDiagnostic._id) {
      await fetchAvailableDates(selectedDiagnostic._id, option);
    }
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    setAvailableSlots([]);
    setShowAllSlots(false);

    if (selectedOption && selectedDiagnostic) {
      await fetchSlots(selectedDiagnostic._id, date, selectedOption);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleSelectAnotherDiagnostic = (diagnostic) => {
    setSelectedDiagnostic(diagnostic);
    setSelectedDate("");
    setSelectedTime("");
    setAvailableSlots([]);
    setAvailableDates([]);
    
    if (selectedOption && diagnostic._id) {
      fetchAvailableDates(diagnostic._id, selectedOption);
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFamilyInputChange = (e) => {
    const { name, value } = e.target;
    setNewFamilyMember((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateAddress = async () => {
    try {
      const response = await axios.post(
        `https://api.elthiumhealth.com/api/staff/create-address/${staffId}`,
        newAddress
      );

      if (response.data.success) {
        await fetchAddresses();
        setShowAddressForm(false);
        setNewAddress({
          street: "",
          city: "",
          state: "",
          country: "India",
          postalCode: "",
          addressType: "Home"
        });
      }
    } catch (error) {
      console.error("Error creating address:", error);
    }
  };

  const handleAddFamilyMember = async () => {
    if (!staffId) return;
    try {
      const response = await axios.post(
        `https://api.elthiumhealth.com/api/staff/create-family/${staffId}`,
        newFamilyMember
      );

      alert("Family member added successfully");
      await fetchFamilyMembers();
      setNewFamilyMember({
        fullName: "",
        mobileNumber: "",
        age: "",
        gender: "",
        DOB: "",
        height: "",
        weight: "",
        relation: "",
        eyeSight: "",
        BP: "",
        BMI: ""
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

  const isAddBookingDisabled = () => {
    if (!selectedOption || !selectedFamilyMember) return true;

    if (selectedOption === "Home Collection") {
      return !selectedAddress || !selectedDate || !selectedTime;
    } else if (selectedOption === "Center Visit") {
      return !selectedDate || !selectedTime;
    }

    return true;
  };

  const fetchWalletData = async () => {
    try {
      const response = await axios.get(
        `https://api.elthiumhealth.com/api/staff/wallet/${staffId}`
      );
      setWalletData(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      return null;
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

  // ✅ NEW FUNCTION: Handle cart items after duplicate error
  const handleManageCartAfterError = () => {
    setShowErrorModal(false);
    navigate('/cart');
  };

  // ✅ NEW FUNCTION: Handle view existing bookings
  const handleViewExistingBookings = () => {
    setShowErrorModal(false);
    navigate('/mybookings');
  };

  // ✅ NEW FUNCTION: Remove duplicate items from current bookings
  const handleRemoveDuplicatesAndRetry = () => {
    if (!bookingError?.duplicateItems || bookings.length === 0) {
      setShowErrorModal(false);
      return;
    }

    // Extract duplicate item IDs
    const duplicateItemIds = bookingError.duplicateItems.map(item => item.itemId);
    
    // Filter out bookings that contain duplicate items
    const updatedBookings = bookings.filter(booking => {
      // Check if this booking's diagnostic has any duplicate items
      const cartItemsInDiagnostic = getCartItemsInDiagnostic(booking.diagnostic);
      const hasDuplicate = cartItemsInDiagnostic.some(item => 
        duplicateItemIds.includes(item.itemId)
      );
      return !hasDuplicate;
    });

    setBookings(updatedBookings);
    setShowErrorModal(false);
    
    // Show message about removed items
    if (updatedBookings.length < bookings.length) {
      alert(`Removed ${bookings.length - updatedBookings.length} bookings with duplicate items. You can now try booking again.`);
    }
  };

  // ✅ MODIFIED: initializeRazorpayMultiplePayment with better error handling
  const initializeRazorpayMultiplePayment = async (totalPrice, walletBalanceUsed) => {
    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Please check your connection.");
      return;
    }

    const amountToPay = totalPrice - walletBalanceUsed;
    console.log("💳 Razorpay Amount:", amountToPay);

    const options = {
      key: "rzp_test_BxtRNvflG06PTV",
      amount: amountToPay * 100, // Razorpay expects amount in paise
      currency: "INR",
      name: "Elthium Health",
      description: `Multiple Diagnostics Booking (${bookings.length} centers)`,
      handler: async function (response) {
        console.log("✅ Razorpay Payment Success:", response);
        const razorpayTransactionId = response.razorpay_payment_id;

        try {
          setProcessingPayment(true);
          
          const bookingPromises = bookings.map(booking => 
            axios.post(
              `https://api.elthiumhealth.com/api/staff/create-bookings/${staffId}`,
              {
                familyMemberId: booking.familyMemberId,
                diagnosticId: booking.diagnostic._id,
                serviceType: booking.serviceType,
                date: booking.date,
                timeSlot: booking.timeSlot,
                addressId: booking.addressId,
                transactionId: razorpayTransactionId,
                walletAmount: walletBalanceUsed || 0,
              }
            )
          );

          const responses = await Promise.all(bookingPromises);
          const allSuccessful = responses.every(response => response.data.isSuccessfull);

          if (allSuccessful) {
            // ✅ Use success modal
            showSuccessAndNavigate({
              type: 'multiple',
              count: bookings.length,
              totalPrice: totalPrice,
              diagnostics: bookings.map(b => b.diagnostic.name)
            });
            setBookings([]);
            handlePopupClose();
          } else {
            // ✅ Check for duplicate item error
            const failedResponse = responses.find(r => !r.data.isSuccessfull);
            if (failedResponse?.data?.duplicateItems) {
              handleDuplicateItemsError(failedResponse.data);
            } else {
              alert("Some bookings failed after payment. Please contact support.");
            }
          }
        } catch (error) {
          console.error("Error completing multiple bookings:", error);
          
          // ✅ Handle duplicate items error from catch block
          if (error.response?.data?.duplicateItems) {
            handleDuplicateItemsError(error.response.data);
          } else {
            alert("Booking completion failed. Please contact support.");
          }
        } finally {
          setProcessingPayment(false);
        }
      },
      prefill: {
        name: localStorage.getItem("staffName") || staff?.name || "Customer",
        email: localStorage.getItem("staffEmail") || "customer@example.com",
        contact: localStorage.getItem("staffPhone") || "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        ondismiss: function() {
          console.log("Razorpay modal dismissed");
          setProcessingPayment(false);
        }
      }
    };

    try {
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Error opening Razorpay:", error);
      alert("Failed to open payment gateway. Please try again.");
      setProcessingPayment(false);
    }
  };

  const getHeaderText = () => {
    if (fromCart && cartItems.length > 0) {
      return `Diagnostic Centers for Your Cart Items`;
    } else {
      return "Your Company's Diagnostic Centers";
    }
  };

  const getDescriptionText = () => {
    if (fromCart && cartItems.length > 0) {
      const matchingCount = filteredDiagnostics.length;
      const totalCount = diagnostics.length;
      return `${matchingCount} out of ${totalCount} diagnostics have your cart items`;
    } else {
      return "Select diagnostic centers from your company's approved list";
    }
  };

  const getDiagnosticColor = (centerType) => {
    switch(centerType?.toLowerCase()) {
      case 'hospital':
        return 'bg-red-50 border-red-200';
      case 'clinic':
        return 'bg-blue-50 border-blue-200';
      case 'lab':
        return 'bg-green-50 border-green-200';
      case 'diagnostic center':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getDiagnosticIcon = (centerType) => {
    switch(centerType?.toLowerCase()) {
      case 'hospital':
        return '🏥';
      case 'clinic':
        return '🏥';
      case 'lab':
        return '🧪';
      case 'diagnostic center':
        return '🏢';
      default:
        return '🏥';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "";
    return timeString.replace(":00", "").replace(/(AM|PM)/, " $1");
  };

  const getCountDisplay = (diagnostic, type) => {
    const items = diagnostic[type];
    if (!Array.isArray(items)) return "0";
    const count = items.length;
    return count > 0 ? `${count}+` : "0";
  };

  const getDetailsTitle = () => {
    switch(selectedDetailsType) {
      case 'tests': return 'Available Tests';
      case 'scans': return 'Available Scans';
      case 'packages': return 'Health Packages';
      default: return 'Details';
    }
  };

  const getDetailsIcon = () => {
    switch(selectedDetailsType) {
      case 'tests': return <TestTube className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />;
      case 'scans': return <Scan className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />;
      case 'packages': return <Package className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />;
      default: return null;
    }
  };

  const getEmptyMessage = () => {
    switch(selectedDetailsType) {
      case 'tests': return 'No tests available for this diagnostic center.';
      case 'scans': return 'No scans available for this diagnostic center.';
      case 'packages': return 'No packages available for this diagnostic center.';
      default: return 'No data available.';
    }
  };

  const renderDiagnosticCard = (diagnostic) => {
    const isAlreadyBooked = bookings.some(b => b.diagnostic._id === diagnostic._id);
    const hasCartItems = checkDiagnosticHasCartItems(diagnostic);
    const cartItemsInDiagnostic = getCartItemsInDiagnostic(diagnostic);
    
    return (
      <div key={diagnostic._id} className="group bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2">
        <div className="relative p-4 sm:p-6">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${diagnostic.centerType?.toLowerCase() === 'hospital' ? 'bg-red-100 text-red-800' : 
              diagnostic.centerType?.toLowerCase() === 'clinic' ? 'bg-blue-100 text-blue-800' : 
              diagnostic.centerType?.toLowerCase() === 'lab' ? 'bg-green-100 text-green-800' : 
              'bg-purple-100 text-purple-800'}`}>
              {diagnostic.centerType || "Diagnostic"}
            </span>
          </div>
          
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
              Approved
            </span>
          </div>
          
          {fromCart && hasCartItems && cartItemsInDiagnostic.length > 0 && (
            <div className="absolute top-12 sm:top-16 left-3 sm:left-4 z-10">
              <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm flex items-center">
                <Check className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                {cartItemsInDiagnostic.length} Cart Item{cartItemsInDiagnostic.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {isAlreadyBooked && (
            <div className={`absolute ${fromCart && hasCartItems ? 'top-12 left-20 sm:top-16 sm:left-24' : 'top-12 left-3 sm:top-16 sm:left-4'} z-10`}>
              <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                ✓ Added
              </span>
            </div>
          )}
          
          <div className={`mb-3 sm:mb-4 p-2 sm:p-4 rounded-lg sm:rounded-xl inline-block ${getDiagnosticColor(diagnostic.centerType)}`}>
            <span className="text-2xl sm:text-3xl">{getDiagnosticIcon(diagnostic.centerType)}</span>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">
            {diagnostic.name}
          </h3>
          
          <div className="flex items-start mb-3 sm:mb-4">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
              {diagnostic.address}
            </p>
          </div>
          
          {fromCart && cartItemsInDiagnostic.length > 0 && (
            <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs font-medium text-orange-800 mb-1">
                Your cart items available here:
              </p>
              <div className="space-y-1">
                {cartItemsInDiagnostic.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <Check className="w-2 h-2 sm:w-3 sm:h-3 text-green-600 mr-1 sm:mr-2" />
                    <span className="text-xs text-gray-700 truncate">{item.title}</span>
                  </div>
                ))}
                {cartItemsInDiagnostic.length > 2 && (
                  <p className="text-xs text-gray-600">
                    +{cartItemsInDiagnostic.length - 2} more items
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
            <div 
              onClick={() => handleDetailsClick(diagnostic, 'tests')}
              className="bg-blue-50 rounded-lg p-1.5 sm:p-2 text-center cursor-pointer hover:bg-blue-100 transition-colors duration-200 border border-blue-100 hover:border-blue-300 active:scale-95"
              title="Click to view available tests"
            >
              <div className="flex items-center justify-center">
                <TestTube className="w-2 h-2 sm:w-3 sm:h-3 text-blue-600 mr-0.5 sm:mr-1" />
                <span className="text-xs font-medium text-blue-700">
                  {getCountDisplay(diagnostic, 'tests')} Tests
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-blue-500 mt-0.5 opacity-70">
                Click to view
              </div>
            </div>
            
            <div 
              onClick={() => handleDetailsClick(diagnostic, 'scans')}
              className="bg-green-50 rounded-lg p-1.5 sm:p-2 text-center cursor-pointer hover:bg-green-100 transition-colors duration-200 border border-green-100 hover:border-green-300 active:scale-95"
              title="Click to view available scans"
            >
              <div className="flex items-center justify-center">
                <Scan className="w-2 h-2 sm:w-3 sm:h-3 text-green-600 mr-0.5 sm:mr-1" />
                <span className="text-xs font-medium text-green-700">
                  {getCountDisplay(diagnostic, 'scans')} Scans
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-green-500 mt-0.5 opacity-70">
                Click to view
              </div>
            </div>
            
            <div 
              onClick={() => handleDetailsClick(diagnostic, 'packages')}
              className="bg-purple-50 rounded-lg p-1.5 sm:p-2 text-center cursor-pointer hover:bg-purple-100 transition-colors duration-200 border border-purple-100 hover:border-purple-300 active:scale-95"
              title="Click to view available packages"
            >
              <div className="flex items-center justify-center">
                <Package className="w-2 h-2 sm:w-3 sm:h-3 text-purple-600 mr-0.5 sm:mr-1" />
                <span className="text-xs font-medium text-purple-700">
                  {getCountDisplay(diagnostic, 'packages')} Packages
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-purple-500 mt-0.5 opacity-70">
                Click to view
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
            {diagnostic.description && (
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{diagnostic.description}</p>
            )}
            
            {diagnostic.phone && (
              <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span>{diagnostic.phone}</span>
              </div>
            )}
            
            {diagnostic.email && (
              <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="truncate">{diagnostic.email}</span>
              </div>
            )}
          </div>
          
          {diagnostic.price && (
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded-lg">
                <span className="text-xs sm:text-sm text-gray-600">Approx. Price</span>
                <span className="text-base sm:text-lg font-bold text-blue-600">₹{diagnostic.price}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => handleDiagnosticClick(diagnostic)}
            disabled={isAlreadyBooked}
            className={`w-full py-2.5 sm:py-3.5 font-semibold rounded-xl border-2 transition-all duration-300 group-hover:shadow-md flex items-center justify-center text-sm sm:text-base ${
              isAlreadyBooked
                ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 hover:text-blue-800 hover:shadow-lg'
            }`}
          >
            {isAlreadyBooked ? (
              <>
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Already Added
              </>
            ) : (
              <>
                <span>Select Diagnostic</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 sm:px-6 sm:py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">Available Today</span>
            </div>
            <span className="text-xs text-gray-500">
              {diagnostic.phone ? '24/7' : 'Mon-Sun'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        {/* Back button for mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        <div className="flex-grow bg-gradient-to-br from-gray-50 to-blue-50 py-6 sm:py-8 md:py-10">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                {getHeaderText()}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                {getDescriptionText()}
              </p>
              {error && <p className="text-red-500 mt-2 sm:mt-4 text-sm sm:text-base">{error}</p>}
              
              {fromCart && cartItems.length > 0 && (
                <div className="mt-2 sm:mt-4 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 rounded-full">
                  <span className="text-blue-700 font-medium text-sm sm:text-base">
                    📦 {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in cart
                  </span>
                </div>
              )}
            </div>

            {bookings.length > 0 && (
              <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                      <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        Your Bookings ({bookings.length})
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">Total: ₹{calculateTotalPrice()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={handleMultipleBookings}
                      disabled={processingPayment}
                      className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center text-sm sm:text-base"
                    >
                      {processingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-3 h-3 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                          Book All ({bookings.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm relative group hover:shadow-md transition-shadow">
                      <button
                        onClick={() => removeBooking(booking.id)}
                        className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white p-1 sm:p-1.5 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                      >
                        <Trash2 size={12} className="sm:w-4 sm:h-4" />
                      </button>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{booking.diagnostic.name}</h4>
                          <div className="flex flex-wrap items-center mt-1">
                            <span className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-800 rounded-full mr-1 sm:mr-2">
                              {booking.serviceType}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(booking.date)}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 sm:mt-2">
                            Time: <span className="font-semibold">{formatTimeDisplay(booking.timeSlot)}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {booking.diagnostic.address?.split(",")[0]}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-sm font-bold text-gray-900">₹{booking.price || 0}</p>
                          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mt-1 sm:mt-2 ${booking.diagnostic.centerType?.toLowerCase() === 'hospital' ? 'bg-red-500' : 
                            booking.diagnostic.centerType?.toLowerCase() === 'clinic' ? 'bg-blue-500' : 
                            booking.diagnostic.centerType?.toLowerCase() === 'lab' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200 text-center">
                  <button
                    onClick={() => {
                      setSelectedDiagnostic(null);
                      setShowServiceModal(false);
                      setShowBookingModal(false);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto hover:bg-blue-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Add Another Diagnostic
                  </button>
                </div>
              </div>
            )}
            
            {loading && (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading diagnostic centers...</p>
              </div>
            )}
            
            {filteredDiagnostics.length === 0 && !loading && fromCart && cartItems.length > 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 mb-3 sm:mb-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-600 text-base sm:text-lg mb-2">No diagnostic centers found for your cart items.</p>
                <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">Try adding different tests/scans or contact your company.</p>
                <button
                  onClick={() => navigate('/cart')}
                  className="mt-2 sm:mt-4 px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Go Back to Cart
                </button>
              </div>
            )}
            
            {filteredDiagnostics.length === 0 && !loading && !fromCart && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 mb-3 sm:mb-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-600 text-base sm:text-lg">No diagnostic centers available for your company.</p>
                <button
                  onClick={fetchCompanyDiagnostics}
                  className="mt-2 sm:mt-4 px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {filteredDiagnostics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredDiagnostics.map((diagnostic) => renderDiagnosticCard(diagnostic))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ INSUFFICIENT BALANCE MODAL */}
        {showInsufficientBalanceModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <AlertCircle className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Insufficient Balance</h3>
                    <p className="text-amber-100 text-sm mt-1">Complete payment to proceed</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Wallet Balance:</span>
                      <span className="font-bold text-gray-900">₹{insufficientBalanceData.walletAvailable}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-gray-900">₹{insufficientBalanceData.totalPrice}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2 pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Required Online Payment:</span>
                        <span className="font-bold text-orange-600">₹{insufficientBalanceData.requiredOnline}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Your wallet balance is insufficient. Please pay the remaining amount online.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => setShowInsufficientBalanceModal(false)}
                    className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleOnlinePayment}
                    className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay ₹{insufficientBalanceData.requiredOnline}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ BOOKING PREVIEW MODAL */}
        {showPreviewModal && previewBooking && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <Eye className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Preview Your Booking</h3>
                    <p className="text-blue-100 text-sm mt-1">Please review before adding to cart</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Diagnostic Info */}
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${getDiagnosticColor(previewBooking.diagnostic.centerType)}`}>
                      <span className="text-2xl">{getDiagnosticIcon(previewBooking.diagnostic.centerType)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{previewBooking.diagnostic.name}</h4>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {previewBooking.diagnostic.address?.split(",")[0]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Service Type</span>
                    <span className="font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
                      {previewBooking.serviceType}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Date</span>
                    <span className="font-semibold text-gray-900">{formatDate(previewBooking.date)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Time</span>
                    <span className="font-semibold text-gray-900">{formatTimeDisplay(previewBooking.timeSlot)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Patient</span>
                    <span className="font-semibold text-gray-900">
                      {previewBooking.familyMemberId === staff?._id 
                        ? staff?.name 
                        : familyMembers.find(m => m._id === previewBooking.familyMemberId)?.fullName || 'Self'}
                    </span>
                  </div>

                  {previewBooking.serviceType === "Home Collection" && previewBooking.addressId && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start">
                        <Home className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <span className="text-gray-600 font-medium block mb-1">Collection Address</span>
                          <span className="text-gray-900 text-sm">
                            {addresses.find(a => a._id === previewBooking.addressId)?.street}, 
                            {addresses.find(a => a._id === previewBooking.addressId)?.city}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-700">Total Price</span>
                      <span className="text-2xl font-bold text-blue-600">₹{previewBooking.price || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setPreviewBooking(null);
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={confirmAddToBookings}
                    className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ SAME DATE/TIME SLOT ERROR MODAL */}
        {showSameSlotModal && sameSlotError && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 sm:p-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <Clock className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Same Date & Time Slot</h3>
                    <p className="text-amber-100 text-sm mt-1">Cannot book multiple diagnostics at same time</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                {/* Error Message */}
                <div className="mb-5">
                  <p className="text-gray-800 font-medium mb-3">{sameSlotError}</p>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">Please choose:</p>
                        <ul className="text-sm text-amber-700 mt-2 space-y-1">
                          <li>• A different date for this diagnostic</li>
                          <li>• A different time slot for this diagnostic</li>
                          <li>• Remove the existing booking with same time</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowSameSlotModal(false);
                      setSelectedDate("");
                      setSelectedTime("");
                      setAvailableSlots([]);
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center text-sm"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Choose Different Time
                  </button>
                  
                  <button
                    onClick={() => setShowSameSlotModal(false)}
                    className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all duration-300 flex items-center justify-center text-sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </button>
                </div>

                {/* Existing Bookings Info */}
                {bookings.filter(b => b.date === selectedDate && b.timeSlot === selectedTime).length > 0 && (
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Existing booking at same time:</p>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {bookings
                        .filter(b => b.date === selectedDate && b.timeSlot === selectedTime)
                        .map((booking, idx) => (
                          <div key={idx} className="flex items-center justify-between mb-2 last:mb-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{booking.diagnostic.name}</p>
                              <p className="text-xs text-gray-600">{formatDate(booking.date)} • {formatTimeDisplay(booking.timeSlot)}</p>
                            </div>
                            <button
                              onClick={() => {
                                removeBooking(booking.id);
                                setShowSameSlotModal(false);
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ DUPLICATE ITEMS ERROR MODAL */}
        {showErrorModal && bookingError && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-amber-500 p-5 sm:p-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <AlertCircle className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Already Booked Items</h3>
                    <p className="text-red-100 text-sm mt-1">Cannot book same test/package again</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                {/* Error Message */}
                <div className="mb-5">
                  <p className="text-gray-800 font-medium mb-3">{bookingError.message}</p>
                  {bookingError.suggestion && (
                    <div className="flex items-start bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{bookingError.suggestion}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  <button
                    onClick={handleManageCartAfterError}
                    className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center justify-center text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Manage Cart
                  </button>
                  
                  <button
                    onClick={handleViewExistingBookings}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center text-sm"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View Bookings
                  </button>
                  
                  <button
                    onClick={handleRemoveDuplicatesAndRetry}
                    className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all duration-300 flex items-center justify-center text-sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove & Retry
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Info className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    <p>Note: You cannot book the same test/package that you have already booked in an active booking.</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-5 py-4 border-t border-gray-200">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full px-4 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ SUCCESS MODAL */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-fadeIn">
              {/* Simple Header */}
              <div className="bg-green-500 p-5 rounded-t-2xl text-center">
                <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-3">
                  <Check className="w-8 h-8 text-green-500" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Booking Confirmed!</h3>
                <p className="text-green-100 text-sm">
                  {bookingSuccessData?.type === 'multiple' 
                    ? `${bookingSuccessData.count} diagnostics booked successfully`
                    : 'Your booking has been confirmed'}
                </p>
              </div>

              {/* Simple Content */}
              <div className="p-5">
                {/* Booking Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  {bookingSuccessData?.type === 'multiple' ? (
                    <>
                      <h4 className="font-semibold text-gray-900 mb-2">Multiple Diagnostics</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Bookings:</span>
                          <span className="font-bold text-blue-600">{bookingSuccessData.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Amount:</span>
                          <span className="font-bold text-green-600">₹{bookingSuccessData.totalPrice}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="font-semibold text-gray-900 truncate">{selectedDiagnostic?.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">Package Price:</span>
                        <span className="font-bold text-green-600">₹{selectedDiagnostic?.price || 0}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Countdown Timer */}
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center px-3 py-1 bg-amber-50 rounded-full">
                    <Clock3 className="w-3 h-3 text-amber-600 mr-1" />
                    <span className="text-xs text-amber-700">
                      Redirecting in <span className="font-bold">{countdown}</span>s
                    </span>
                  </div>
                </div>

                {/* Single Button */}
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

        {/* Details Modal */}
        {showDetailsModal && selectedDiagnostic && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-start sm:items-center p-2 sm:p-4 z-50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl mt-4 sm:mt-0">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="mr-3 sm:mr-4">
                      {getDetailsIcon()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                        {getDetailsTitle()}
                      </h3>
                      <p className="text-gray-600 mt-1 text-xs sm:text-sm truncate">
                        {selectedDiagnostic.name} • {selectedDiagnostic.address?.split(",")[0]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedDetailsType("");
                      setDetailsData([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0 ml-2"
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
                {detailsLoading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading {selectedDetailsType}...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 sm:mb-6">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                        Total {selectedDetailsType.charAt(0).toUpperCase() + selectedDetailsType.slice(1)}: {detailsData.length}
                      </h4>
                    </div>
                    
                    {detailsData.length > 0 ? (
                      <div className="grid gap-3 sm:gap-4">
                        {detailsData.map((item, index) => {
                          const isInCart = cartItems.some(cartItem => cartItem.itemId === item._id);
                          
                          return (
                            <div key={item._id || index} className={`bg-gray-50 rounded-xl p-3 sm:p-5 border ${isInCart ? 'border-green-300 bg-green-50' : 'border-gray-200'} hover:border-gray-300 transition-colors`}>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center flex-wrap">
                                    <h5 className="font-semibold text-gray-900 text-sm sm:text-lg truncate">
                                      {item.name || item.title || `${selectedDetailsType.slice(0, -1)} ${index + 1}`}
                                    </h5>
                                    {isInCart && (
                                      <span className="ml-2 mt-1 sm:mt-0 sm:ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        In Your Cart
                                      </span>
                                    )}
                                  </div>
                                  
                                  {item.description && (
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">{item.description}</p>
                                  )}
                                  
                                  {item.preparation && (
                                    <div className="mt-2 sm:mt-3">
                                      <span className="text-xs sm:text-sm font-medium text-gray-700">Preparation: </span>
                                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{item.preparation}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3">
                                    {item.price !== undefined && item.price !== null && (
                                      <div className="flex items-center">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700 mr-1 sm:mr-2">Price:</span>
                                        <span className="text-base sm:text-lg font-bold text-blue-600">₹{item.price}</span>
                                      </div>
                                    )}
                                    
                                    {(item.reportHour || item.reportTime) && (
                                      <div className="flex items-center">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700 mr-1 sm:mr-2">Report:</span>
                                        <span className="text-xs sm:text-sm text-gray-600">{item.reportHour || item.reportTime} hours</span>
                                      </div>
                                    )}
                                    
                                    {item.totalTestsIncluded && (
                                      <div className="flex items-center">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700 mr-1 sm:mr-2">Tests:</span>
                                        <span className="text-xs sm:text-sm font-bold text-purple-600">{item.totalTestsIncluded}</span>
                                      </div>
                                    )}
                                    
                                    {item.fastingRequired !== undefined && (
                                      <div className="flex items-center">
                                        <span className="text-xs sm:text-sm font-medium text-gray-700 mr-1 sm:mr-2">Fasting:</span>
                                        <span className={`text-xs sm:text-sm ${item.fastingRequired ? 'text-red-600' : 'text-green-600'}`}>
                                          {item.fastingRequired ? 'Required' : 'Not Required'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mt-2 sm:mt-0 sm:ml-4">
                                  {item.gender && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      item.gender === 'Male' ? 'bg-blue-100 text-blue-800' :
                                      item.gender === 'Female' ? 'bg-pink-100 text-pink-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {item.gender}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <div className="text-gray-300 mb-3 sm:mb-4">
                          {selectedDetailsType === 'tests' && <TestTube className="w-12 h-12 sm:w-20 sm:h-20 mx-auto" />}
                          {selectedDetailsType === 'scans' && <Scan className="w-12 h-12 sm:w-20 sm:h-20 mx-auto" />}
                          {selectedDetailsType === 'packages' && <Package className="w-12 h-12 sm:w-20 sm:h-20 mx-auto" />}
                        </div>
                        <p className="text-gray-600 text-base sm:text-lg">{getEmptyMessage()}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0 text-center sm:text-left">
                    Showing details for <span className="font-semibold truncate">{selectedDiagnostic.name}</span>
                  </p>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedDetailsType("");
                      setDetailsData([]);
                    }}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base w-full sm:w-auto"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Type Selection Modal */}
        {showServiceModal && selectedDiagnostic && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-start sm:items-center p-2 sm:p-4 z-50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl w-full max-w-md shadow-2xl mt-4 sm:mt-0 transform transition-all duration-300 scale-100">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-2 sm:mb-4">
                  <Building className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Book Appointment
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">Select service type for {selectedDiagnostic.name}</p>
                {selectedDiagnostic.price && (
                  <div className="mt-1 sm:mt-2 inline-block px-3 py-1 sm:px-4 sm:py-2 bg-blue-50 rounded-lg">
                    <span className="text-blue-700 font-medium text-sm sm:text-base">Approx. Price: ₹{selectedDiagnostic.price}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => handleServiceSelect("Home Collection")}
                  className="w-full p-3 sm:p-4 md:p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-100 rounded-xl flex items-center transition-all duration-300 hover:from-green-100 hover:to-emerald-100 hover:border-green-200 hover:shadow-lg group"
                >
                  <div className="bg-green-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4 group-hover:bg-green-200 transition-colors flex-shrink-0">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 group-hover:text-green-700 truncate">Home Collection</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Book lab tests with sample collection at your doorsteps</p>
                  </div>
                  <div className="ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => handleServiceSelect("Center Visit")}
                  className="w-full p-3 sm:p-4 md:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl flex items-center transition-all duration-300 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-200 hover:shadow-lg group"
                >
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    <Building className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 group-hover:text-blue-700 truncate">Center Visit</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Find nearby clinics or diagnostic centers</p>
                  </div>
                  <div className="ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </button>
              </div>

              <div className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 border-t border-gray-200">
                <button
                  onClick={handlePopupClose}
                  className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ FIXED: Booking Details Modal - Mobile and Desktop Compatible */}
        {showBookingModal && selectedDiagnostic && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-start sm:items-center p-0 sm:p-4 z-50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-none sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-6xl sm:max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header - Mobile and Desktop */}
              <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <button
                      onClick={handlePopupClose}
                      className="text-gray-600 hover:text-gray-900 mr-2 sm:mr-4 flex-shrink-0"
                    >
                      <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                        Book {selectedDiagnostic.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedDiagnostic.centerType?.toLowerCase() === 'hospital' ? 'bg-red-100 text-red-800' : 
                          selectedDiagnostic.centerType?.toLowerCase() === 'clinic' ? 'bg-blue-100 text-blue-800' : 
                          selectedDiagnostic.centerType?.toLowerCase() === 'lab' ? 'bg-green-100 text-green-800' : 
                          'bg-purple-100 text-purple-800'}`}>
                          {selectedDiagnostic.centerType || "Diagnostic Center"}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {selectedOption === "Home Collection" ? "🏠 Home Collection" : "🏢 Center Visit"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handlePopupClose}
                    className="hidden sm:block text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors flex-shrink-0"
                  >
                    <X size={22} />
                  </button>
                </div>
                
                {/* Quick Info Bar */}
                <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">{selectedDiagnostic.address?.split(",")[0]}</span>
                    </div>
                    {selectedDiagnostic.phone && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-600">{selectedDiagnostic.phone}</span>
                      </div>
                    )}
                    {selectedDiagnostic.price && (
                      <div className="flex items-center">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 mr-1 sm:mr-2">Price:</span>
                        <span className="text-sm sm:text-lg font-bold text-blue-600">₹{selectedDiagnostic.price}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 mr-1 sm:mr-2">Service:</span>
                      <span className="text-xs sm:text-sm font-medium text-green-600">{selectedOption}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Booking Form */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Date Selection */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                      <div className="flex items-center mb-4">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-base sm:text-lg font-semibold text-gray-800">Choose Date</h4>
                          <p className="text-xs sm:text-sm text-gray-600">Select a date for your appointment</p>
                        </div>
                      </div>
                      
                      {availableDates.length > 0 ? (
                        <>
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            {(showAllDates ? availableDates : availableDates.slice(0, 6)).map((date, index) => {
                              const dateObj = new Date(date);
                              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                              const dayName = dayNames[dateObj.getDay()];
                              const dayNumber = dateObj.getDate();
                              const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

                              return (
                                <button
                                  key={index}
                                  onClick={() => handleDateSelect(date)}
                                  className={`flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-sm relative transition-all duration-300 flex-shrink-0 ${selectedDate === date
                                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md border border-gray-200'
                                    }`}
                                >
                                  {selectedDate === date && (
                                    <span className="absolute -top-1 -right-1 bg-white border border-blue-500 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg">
                                      <Check size={10} className="text-blue-600" strokeWidth={3} />
                                    </span>
                                  )}
                                  <span className="text-xs font-medium opacity-80">{dayName}</span>
                                  <span className="text-xl sm:text-2xl font-bold mt-1">{dayNumber}</span>
                                  <span className="text-xs font-medium opacity-80 mt-1">{month}</span>
                                </button>
                              );
                            })}
                          </div>

                          {availableDates.length > 6 && (
                            <div className="text-center mt-4">
                              <button
                                type="button"
                                onClick={() => setShowAllDates(!showAllDates)}
                                className="text-blue-600 text-sm font-medium hover:text-blue-700 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                {showAllDates ? 'Show Less' : `View All ${availableDates.length} Dates`}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-xl">
                          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 text-sm sm:text-base">No available dates found. Please try another service type.</p>
                        </div>
                      )}
                    </div>

                    {/* Time Slot Selection */}
                    {selectedDate && selectedOption && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center mb-4">
                          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="text-base sm:text-lg font-semibold text-gray-800">Choose Time Slot</h4>
                            <p className="text-xs sm:text-sm text-gray-600">Select a time for your appointment</p>
                          </div>
                        </div>

                        {slotLoading && (
                          <div className="text-center py-6">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-600"></div>
                            <p className="mt-3 text-gray-600 text-sm sm:text-base">Loading available slots...</p>
                          </div>
                        )}
                        
                        {slotError && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-600 text-center text-sm sm:text-base">{slotError}</p>
                          </div>
                        )}

                        {!slotLoading && availableSlots.length > 0 && (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                              {(showAllSlots ? availableSlots : availableSlots.slice(0, 8)).map((slot, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleTimeSelect(slot.timeSlot)}
                                  className={`px-3 py-3 sm:px-4 sm:py-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${selectedTime === slot.timeSlot
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

                            {availableSlots.length > 8 && (
                              <div className="text-center mt-4">
                                <button
                                  type="button"
                                  onClick={() => setShowAllSlots(!showAllSlots)}
                                  className="text-blue-600 text-sm font-medium hover:text-blue-700 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  {showAllSlots ? 'Show Less' : `View All ${availableSlots.length} Slots`}
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {!slotLoading && availableSlots.length === 0 && !slotError && selectedDate && (
                          <div className="text-center py-6 bg-gray-50 rounded-xl">
                            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 text-sm sm:text-base">No available time slots for the selected date.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Family Member Selection */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center mb-3 sm:mb-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                          <div>
                            <h4 className="text-base sm:text-lg font-semibold text-gray-800">Select Patient</h4>
                            <p className="text-xs sm:text-sm text-gray-600">Who is this appointment for?</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowFamilyForm(true)}
                          className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Family Member
                        </button>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {staff && staff._id && (
                          <label
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex justify-between items-center ${selectedFamilyMember === staff._id
                              ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            <div className="flex items-center min-w-0">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{staff.name}</h4>
                                <p className="text-sm text-gray-600 mt-0.5">Self • {staff.age || "N/A"} yrs • {staff.gender || "N/A"}</p>
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="selectedFamilyMember"
                              value={staff._id}
                              checked={selectedFamilyMember === staff._id}
                              onChange={() => handleFamilyMemberSelect(staff._id)}
                              className="form-radio h-5 w-5 text-blue-600 flex-shrink-0 ml-2"
                            />
                          </label>
                        )}

                        {familyMembers.map((member) => (
                          <label
                            key={member._id}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex justify-between items-center ${selectedFamilyMember === member._id
                              ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            <div className="flex items-center min-w-0">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <User className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{member.fullName}</h4>
                                <p className="text-sm text-gray-600 mt-0.5">
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
                              className="form-radio h-5 w-5 text-blue-600 flex-shrink-0 ml-2"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Address Selection for Home Collection */}
                    {selectedOption === "Home Collection" && selectedDate && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                            <div>
                              <h4 className="text-base sm:text-lg font-semibold text-gray-800">Select Address</h4>
                              <p className="text-xs sm:text-sm text-gray-600">Where should we collect the sample?</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowAddressForm(true)}
                            className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Address
                          </button>
                        </div>

                        {addresses.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {addresses.map((address) => (
                              <label
                                key={address._id}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col ${selectedAddress === address._id
                                  ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center min-w-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${address.addressType === 'Home' ? 'bg-blue-100' :
                                      address.addressType === 'Work' ? 'bg-green-100' : 'bg-purple-100'
                                      }`}>
                                      {address.addressType === 'Home' ? (
                                        <Home className="w-4 h-4 text-blue-600" />
                                      ) : address.addressType === 'Work' ? (
                                        <Building className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <MapPin className="w-4 h-4 text-purple-600" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-semibold text-gray-900">{address.addressType}</h4>
                                      <p className="text-sm text-gray-600 mt-0.5 truncate">
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
                                    className="form-radio h-5 w-5 text-blue-600 flex-shrink-0 ml-2"
                                  />
                                </div>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-xl">
                            <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 text-sm sm:text-base mb-3">No addresses found.</p>
                            <button
                              onClick={() => setShowAddressForm(true)}
                              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              Add Your First Address
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column - Summary and Actions */}
                  <div className="space-y-6">
                    {/* Current Booking Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${getDiagnosticColor(selectedDiagnostic.centerType)}`}>
                            <span className="text-lg">{getDiagnosticIcon(selectedDiagnostic.centerType)}</span>
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-semibold text-gray-900 truncate">{selectedDiagnostic.name}</h5>
                            <p className="text-xs text-gray-600 truncate">{selectedOption}</p>
                          </div>
                        </div>
                        
                        {selectedDate && (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{formatDate(selectedDate)}</span>
                          </div>
                        )}
                        
                        {selectedTime && (
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{formatTimeDisplay(selectedTime)}</span>
                          </div>
                        )}
                        
                        {selectedFamilyMember && (
                          <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">
                              {selectedFamilyMember === staff?._id 
                                ? staff?.name 
                                : familyMembers.find(m => m._id === selectedFamilyMember)?.fullName}
                            </span>
                          </div>
                        )}
                        
                        {selectedOption === "Home Collection" && selectedAddress && (
                          <div className="flex items-center text-gray-600">
                            <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="text-sm truncate">
                              {addresses.find(a => a._id === selectedAddress)?.addressType}
                            </span>
                          </div>
                        )}
                        
                        {selectedDiagnostic.price && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Price:</span>
                              <span className="text-xl font-bold text-blue-600">₹{selectedDiagnostic.price}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={addToBookings}
                        disabled={isAddBookingDisabled()}
                        className={`w-full mt-6 px-4 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center text-base ${
                          isAddBookingDisabled()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        }`}
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        Preview Booking
                      </button>
                    </div>

                    {/* All Diagnostics List */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">All Diagnostics</h4>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {filteredDiagnostics.map((diagnostic) => {
                          const isSelected = selectedDiagnostic._id === diagnostic._id;
                          const isBooked = bookings.some(b => b.diagnostic._id === diagnostic._id);
                          const hasCartItems = checkDiagnosticHasCartItems(diagnostic);
                          
                          return (
                            <div
                              key={diagnostic._id}
                              onClick={() => handleSelectAnotherDiagnostic(diagnostic)}
                              className={`p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
                                isSelected
                                  ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              } ${isBooked ? 'opacity-70' : ''}`}
                            >
                              <div className="flex items-center">
                                <div className={`p-1.5 rounded-lg mr-2 ${getDiagnosticColor(diagnostic.centerType)}`}>
                                  <span className="text-sm">{getDiagnosticIcon(diagnostic.centerType)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h5 className="font-semibold text-gray-900 text-sm truncate">{diagnostic.name}</h5>
                                    <div className="flex flex-col items-end ml-2">
                                      {isBooked && (
                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full mb-1">
                                          ✓ Added
                                        </span>
                                      )}
                                      {hasCartItems && (
                                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                                          Cart Items
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                                      {getCountDisplay(diagnostic, 'tests')} Tests
                                    </span>
                                    <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded">
                                      {getCountDisplay(diagnostic, 'scans')} Scans
                                    </span>
                                    <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                                      {getCountDisplay(diagnostic, 'packages')} Pkgs
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Multiple Bookings Summary */}
                    {bookings.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">Your Bookings</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {bookings.length}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                          {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-lg p-2 border border-gray-200">
                              <div className="flex justify-between items-center">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{booking.diagnostic.name}</p>
                                  <p className="text-xs text-gray-600">
                                    {formatDate(booking.date)} • {formatTimeDisplay(booking.timeSlot)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeBooking(booking.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="pt-3 border-t border-blue-200">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-gray-700">Total:</span>
                            <span className="text-lg font-bold text-blue-600">₹{calculateTotalPrice()}</span>
                          </div>
                          
                          <button
                            onClick={handleMultipleBookings}
                            disabled={processingPayment}
                            className={`w-full py-2.5 font-semibold rounded-lg transition-all duration-300 text-sm ${
                              processingPayment
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-md'
                            }`}
                          >
                            {processingPayment ? 'Processing...' : `Book All (${bookings.length})`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Address Form Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-start sm:items-center p-2 sm:p-4 z-50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl w-full max-w-md shadow-2xl mt-4 sm:mt-0">
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-2 sm:mb-4">
                  <Home className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Add New Address</h3>
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
          <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-start sm:items-center p-2 sm:p-4 z-50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto mt-4 sm:mt-0">
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-2 sm:mb-4">
                  <User className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Add Family Member</h2>
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
      </div>
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DiagnosticsPage;