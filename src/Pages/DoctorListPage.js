import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment-timezone";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { X, Check, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DoctorListPage = () => {
  const { categoryName } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [newFamilyMember, setNewFamilyMember] = useState({
    fullName: "",
    mobileNumber: "",
    age: "",
    gender: "",
    DOB: "",
    height: "",
    weight: "",
    relation: "",
  });
  const location = useLocation();

  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { consultationType: passedConsultationType } = location.state || {};
  const [consultationType, setConsultationType] = useState(passedConsultationType || "Online");
  const [showAllSlots, setShowAllSlots] = useState(false);
  const navigate = useNavigate();
  const staffId = localStorage.getItem("staffId");

  // ✅ FILTER DOCTORS BASED ON CONSULTATION TYPE
  const filterDoctorsByConsultationType = (doctorsList, type) => {
    if (!doctorsList || doctorsList.length === 0) return [];

    return doctorsList.filter(doctor => {
      if (!doctor.consultation_type) return true;

      switch (type) {
        case "Online":
          return (doctor.consultation_type === "Online" ||
            doctor.consultation_type === "Both") &&
            doctor.onlineSlots &&
            doctor.onlineSlots.length > 0;

        case "Offline":
          return (doctor.consultation_type === "Offline" ||
            doctor.consultation_type === "Both") &&
            doctor.offlineSlots &&
            doctor.offlineSlots.length > 0;

        default:
          return true;
      }
    });
  };

  // Fetch doctors based on the category
  useEffect(() => {
    axios
      .get(`https://api.elthiumhealth.com/api/admin/getdoctors?categories=${categoryName}`)
      .then((response) => {
        const allDoctors = response.data;
        setDoctors(allDoctors);

        // ✅ Apply consultation type filter
        const filtered = filterDoctorsByConsultationType(allDoctors, consultationType);
        setFilteredDoctors(filtered);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
        setLoading(false);
      });
  }, [categoryName]);

  // ✅ UPDATE FILTERED DOCTORS WHEN CONSULTATION TYPE CHANGES
  useEffect(() => {
    if (doctors.length > 0) {
      const filtered = filterDoctorsByConsultationType(doctors, consultationType);
      setFilteredDoctors(filtered);
    }
  }, [consultationType, doctors]);

  // Fetch family members of the staff
  useEffect(() => {
    if (staffId) {
      axios
        .get(`https://api.elthiumhealth.com/api/staff/getallfamily/${staffId}`)
        .then((response) => {
          setFamilyMembers(response.data.family_members);
        })
        .catch((error) => {
          console.error("Error fetching family members:", error);
        });
    }
  }, [staffId]);

  // Fetch wallet data
  const fetchWalletData = async () => {
    console.log("Fetching wallet data for staffId:", staffId);
    try {
      const response = await axios.get(`https://api.elthiumhealth.com/api/staff/wallet/${staffId}`);
      console.log("Wallet Data Response:", response.data);
      setWalletData(response.data);
      return response.data;
    } catch (error) {
      handleFetchWalletError(error);
      return null;
    }
  };

  // Handle errors when fetching wallet data
  const handleFetchWalletError = (error) => {
    if (error.response) {
      console.error("Server responded with error:", error.response.data);
      console.error("Status code:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  };

  // Fetch available slots for the selected doctor and date
  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;

    setLoadingSlots(true);
    try {
      const response = await axios.get(
        `https://api.elthiumhealth.com/api/staff/doctor-slots/${doctorId}?date=${date}&type=${consultationType}`
      );

      if (response.data.slots && response.data.slots.length > 0) {
        setAvailableSlots(response.data.slots);
      } else {
        setAvailableSlots([]);
        alert("No slots available for the selected date");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      alert("Error fetching available slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedFamilyMember) {
      alert("Please select a family member for the consultation");
      return;
    }

    if (!selectedDate || !selectedSlot) {
      alert("Please select a date and time slot");
      return;
    }

    setProcessingPayment(true);

    try {
      const consultationFee = selectedDoctor.consultation_fee;

      // Fetch wallet data
      let walletDataToUse = walletData;
      if (!walletDataToUse) {
        walletDataToUse = await fetchWalletData();
      }

      const availableDoctorBalance = walletDataToUse?.forDoctors || 0;

      // Check if wallet has sufficient balance
      if (availableDoctorBalance >= consultationFee) {
        const response = await axios.post(
          `https://api.elthiumhealth.com/api/staff/consultationbooking/${staffId}`,
          {
            doctorId: selectedDoctor._id,
            date: selectedDate,
            timeSlot: selectedSlot.timeSlot,
            familyMemberId: selectedFamilyMember,
            type: consultationType,
            useWallet: true,
          }
        );

        if (response.data.isSuccessfull) {
          setBookingData(response.data);
          setBookingSuccess(true);
          alert("Booking Successful with Wallet!");
        } else {
          alert("Booking failed: " + response.data.message);
        }
      } else {
        initializeRazorpayPayment(consultationFee, availableDoctorBalance);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment processing failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const initializeRazorpayPayment = async (amount, walletBalanceUsed) => {
    const options = {
      key: 'rzp_test_BxtRNvflG06PTV',
      amount: (amount - walletBalanceUsed) * 100,
      currency: "INR",
      name: "Elthium Health",
      description: "Doctor Consultation Payment",
      handler: async function (response) {
        const razorpayTransactionId = response.razorpay_payment_id;

        try {
          const bookingResponse = await axios.post(
            `https://api.elthiumhealth.com/api/staff/consultationbooking/${staffId}`,
            {
              doctorId: selectedDoctor._id,
              date: selectedDate,
              timeSlot: selectedSlot.timeSlot,
              familyMemberId: selectedFamilyMember,
              type: consultationType,
              transactionId: razorpayTransactionId,
              walletAmount: walletBalanceUsed,
            }
          );

          if (bookingResponse.data.isSuccessfull) {
            setBookingData(bookingResponse.data);
            setBookingSuccess(true);
            alert("Booking Successful!");
          } else {
            alert("Booking failed after payment: " + bookingResponse.data.message);
          }
        } catch (error) {
          console.error("Error completing booking:", error);
          alert("Booking completion failed. Please contact support.");
        }
      },
      prefill: {
        name: "Patient Name",
        email: "patient@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };

  const handleBookNow = (doctorId) => {
    const doctor = doctors.find((doc) => doc._id === doctorId);
    setSelectedDoctor(doctor);
    setAvailableSlots([]);
    setSelectedDate(null);
    setSelectedSlot(null);
    fetchWalletData();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchAvailableSlots(selectedDoctor._id, date);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConsultationTypeChange = (type) => {
    setConsultationType(type);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots(selectedDoctor._id, selectedDate);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFamilyMember((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFamilyMember = () => {
    if (!staffId) return;
    axios
      .post(`https://api.elthiumhealth.com/api/staff/create-family/${staffId}`, newFamilyMember)
      .then((response) => {
        alert("Family member added successfully");
        setFamilyMembers([...familyMembers, response.data.family_member]);
        setNewFamilyMember({
          fullName: "",
          mobileNumber: "",
          age: "",
          gender: "",
          DOB: "",
          height: "",
          weight: "",
          relation: "",
        });
        setShowFamilyForm(false);
      })
      .catch((error) => {
        console.error("Error adding family member:", error);
      });
  };

  const handleFamilyMemberSelect = (familyMemberId) => {
    setSelectedFamilyMember(familyMemberId);
  };

  const closeBookingModal = () => {
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSelectedFamilyMember(null);
    setBookingSuccess(false);
    setBookingData(null);
    setWalletData(null);
    setAvailableSlots([]);
  };

  const getAvailableDates = () => {
    if (!selectedDoctor) return [];

    let slots = [];
    if (consultationType === "Online") {
      slots = selectedDoctor.onlineSlots || [];
    } else if (consultationType === "Offline") {
      slots = selectedDoctor.offlineSlots || [];
    } else {
      slots = [...(selectedDoctor.onlineSlots || []), ...(selectedDoctor.offlineSlots || [])];
    }

    const uniqueDates = [...new Set(slots.map(slot => slot.date))].sort();
    return uniqueDates;
  };

  const [searchTerm, setSearchTerm] = useState("");

  const searchedDoctors = filteredDoctors.filter(
    (doctor) =>
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    console.log("📍 DoctorListPage Debug:");
    console.log("Consultation Type:", consultationType);
    console.log("Total Doctors:", doctors.length);
    console.log("Filtered Doctors:", filteredDoctors.length);
  }, [consultationType, doctors, filteredDoctors]);

  if (loading) {
    return <p className="text-center text-gray-600">Loading doctors...</p>;
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            {categoryName}
          </h1>

          {/* ✅ CONSULTATION TYPE DISPLAY AND SWITCHER
          <div className="text-center mb-6">
            <div className="inline-flex bg-white rounded-lg shadow-sm border p-1">
              <button
                onClick={() => handleConsultationTypeChange("Online")}
                className={`px-4 py-2 rounded-md font-medium ${
                  consultationType === "Online"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📹 Online Consultation
              </button>
              <button
                onClick={() => handleConsultationTypeChange("Offline")}
                className={`px-4 py-2 rounded-md font-medium ${
                  consultationType === "Offline"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🏥 Clinic Visit
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Showing doctors available for {consultationType === "Online" ? "Virtual" : "In-Clinic"} consultation
            </p>
          </div> */}

          {/* Search Bar */}
          <div className="mb-6 flex justify-end">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                placeholder="Search Doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Doctors Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Found {searchedDoctors.length} doctor{searchedDoctors.length !== 1 ? 's' : ''} for {consultationType.toLowerCase()} consultation
            </p>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchedDoctors.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg mb-2">
                  No doctors found for {consultationType.toLowerCase()} consultation
                </p>
                <p className="text-gray-500 text-sm">
                  Try changing the consultation type or search term
                </p>
              </div>
            ) : (
              searchedDoctors.map((doctor, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-lg hover:scale-[1.02] transition duration-300"
                >
                  {/* Top Section */}
                  <div className="flex items-start justify-between">
                    {/* Image + Info */}
                    <div className="flex items-center space-x-4">
                      <img
                        src={`https://api.elthiumhealth.com${doctor.image}`}
                        alt={doctor.name}
                        className="w-20 h-20 object-cover rounded-square"
                      />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                          {doctor.name}
                        </h2>
                        <p className="text-gray-600">{doctor.specialization}</p>
                        <p className="text-gray-400 text-sm">
                          <i className="fa-solid fa-location-dot"></i> {doctor.address}
                        </p>
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                          {doctor.consultation_type || "Both"}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <span className="text-black font-semibold ml-3 whitespace-nowrap">
                      ₹{doctor.consultation_fee}
                    </span>
                  </div>

                  {/* Button */}
                  <div className="mt-5 text-center">
                    <button
                      onClick={() => handleBookNow(doctor._id)}
                      className="w-full px-4 py-2 btn btn-outline-primary text-blue-500 font-semibold rounded-pill hover:bg-blue-500 hover:text-white transition duration-300"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Booking Modal */}
          {selectedDoctor && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-end sm:items-center z-50">
              <div className="bg-white w-full sm:w-[90%] md:w-[600px] rounded-t-2xl sm:rounded-2xl shadow-lg p-4 max-h-[95vh] overflow-y-auto relative">

                {/* Close Modal */}
                <button
                  onClick={closeBookingModal}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  <X size={22} />
                </button>

                <h2 className="text-center fw-bold fs-5">Schedule A Consultation</h2>

                {/* Doctor Info */}
                <div className="flex items-center gap-4 p-4 rounded-lg shadow-sm border mb-4 mt-6">
                  <img
                    src={`https://api.elthiumhealth.com${selectedDoctor.image}` || "https://via.placeholder.com/60"}
                    alt={selectedDoctor.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{selectedDoctor.name}</h2>
                    <p className="text-sm text-gray-500">{selectedDoctor.specialization}</p>
                  </div>
                </div>

                {/* Fee */}
                <div className="mb-4">
                  <p className="text-gray-700 font-medium">
                    Consultation Fee:{" "}
                    <span className="font-bold text-black">₹{selectedDoctor.consultation_fee}</span>
                  </p>
                  <p className="text-sm text-gray-500">{selectedDoctor.description}</p>
                </div>

                {/* Date Selection */}
                <h3 className="text-base font-semibold mb-2">Choose Date</h3>
                <div className="flex gap-2 mb-4 overflow-x-auto items-center">
                  {getAvailableDates().map((date) => {
                    const isSelected = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={`relative flex flex-col items-center px-3 py-2 rounded-lg border min-w-[60px] ${isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 bg-white"
                          }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1 right-1 bg-green-600 rounded-full w-4 h-4 flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
                            <Check size={10} color="white" strokeWidth={3} />
                          </span>
                        )}
                        <span className="text-xs font-medium">
                          {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span className="text-sm font-bold">
                          {new Date(date).getDate()}
                        </span>
                      </button>
                    );
                  })}

                  {/* Calendar Picker */}
                  <div className="min-w-[60px]">
                    <DatePicker
                      selected={selectedDate ? new Date(selectedDate) : null}
                      onChange={(date) => handleDateSelect(date.toISOString())}
                      includeDates={getAvailableDates().map((d) => new Date(d))}
                      customInput={
                        <button className="flex flex-col items-center justify-center px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100">
                          <Calendar className="text-gray-600" size={20} />
                          <span className="text-xs font-medium mt-1">Pick</span>
                        </button>
                      }
                    />
                  </div>
                </div>

                {/* Time Slots */}
                {/* Time Slots */}
                {selectedDate && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold mb-2">Choose Time</h3>

                    {loadingSlots ? (
                      <p>Loading slots...</p>
                    ) : availableSlots.filter(slot => !slot.isExpired).length > 0 ? (
                      <>
                        {/* Show Only 4 Slots Initially */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(showAllSlots
                            ? availableSlots.filter(slot => !slot.isExpired)
                            : availableSlots.filter(slot => !slot.isExpired).slice(0, 4)
                          ).map((slot) => (
                            <button
                              key={slot._id}
                              onClick={() => handleSlotSelect(slot)}
                              className={`p-3 rounded-lg border text-center transition ${selectedSlot === slot
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50"
                                }`}
                            >
                              {slot.timeSlot}
                            </button>
                          ))}
                        </div>

                        {/* View All / View Less Button */}
                        {availableSlots.filter(slot => !slot.isExpired).length > 4 && (
                          <div className="text-center mt-3">
                            <button
                              onClick={() => setShowAllSlots(!showAllSlots)}
                              className="text-blue-600 text-sm font-medium hover:underline"
                            >
                              {showAllSlots ? "View Less" : "View All"}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No slots available for this date</p>
                    )}
                  </div>
                )}

                {/* Family Members */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowFamilyForm(true)}
                    className="w-full mb-2 p-3 text-sm font-medium text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition"
                  >
                    + Add Family Member
                  </button>

                  <div className="grid gap-2 max-h-32 overflow-y-auto">
                    {familyMembers.map((member) => (
                      <label
                        key={member._id}
                        className={`p-3 rounded-lg border-2 cursor-pointer flex justify-between items-center ${selectedFamilyMember === member._id
                          ? "border-blue-200 bg-blue-50 text-primary"
                          : "border-gray-300"
                          }`}
                      >
                        <div>
                          <h4 className="font-medium">{member.fullName}</h4>
                          <p className="text-xs">
                            {member.relation} • {member.age} yrs • {member.gender}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="selectedFamilyMember"
                          value={member._id}
                          checked={selectedFamilyMember === member._id}
                          onChange={() => handleFamilyMemberSelect(member._id)}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  disabled={processingPayment || !selectedFamilyMember || !selectedDate || !selectedSlot}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-gray-400"
                >
                  {processingPayment ? "Processing..." : "Book Consultation"}
                </button>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {bookingSuccess && bookingData && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                  <p className="text-gray-600 mb-6">Your consultation has been successfully booked.</p>

                  <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
                    <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
                    <p><span className="font-medium">Booking ID:</span> {bookingData.doctorConsultationBookingId}</p>
                    <p><span className="font-medium">Doctor:</span> Dr. {selectedDoctor.name}</p>
                    <p><span className="font-medium">Date:</span> {bookingData.booking.date}</p>
                    <p><span className="font-medium">Time:</span> {selectedSlot.timeSlot}</p>
                    <p><span className="font-medium">Type:</span> {consultationType}</p>
                    <p><span className="font-medium">Amount Paid:</span> ₹{selectedDoctor.consultation_fee}</p>

                    {bookingData.walletUsed > 0 && (
                      <p><span className="font-medium">Wallet Used:</span> ₹{bookingData.walletUsed}</p>
                    )}

                    {bookingData.onlinePaymentUsed > 0 && (
                      <p><span className="font-medium">Online Payment:</span> ₹{bookingData.onlinePaymentUsed}</p>
                    )}

                    {bookingData.meetingLink && (
                      <p className="mt-3">
                        <span className="font-medium">Meeting Link:</span>
                        <a href={bookingData.meetingLink} className="text-blue-600 hover:underline ml-2">Join Consultation</a>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={closeBookingModal}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Family Member Form Modal */}
          {showFamilyForm && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-bold text-center mb-4">Add Family Member</h2>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={newFamilyMember.fullName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    name="mobileNumber"
                    placeholder="Mobile Number"
                    value={newFamilyMember.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={newFamilyMember.age}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <select
                    name="gender"
                    value={newFamilyMember.gender}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="date"
                    name="DOB"
                    value={newFamilyMember.DOB}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    name="height"
                    placeholder="Height (cm)"
                    value={newFamilyMember.height}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    name="weight"
                    placeholder="Weight (kg)"
                    value={newFamilyMember.weight}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <select
                    name="relation"
                    value={newFamilyMember.relation}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
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

                <div className="flex justify-between">
                  <button
                    onClick={() => setShowFamilyForm(false)}
                    className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFamilyMember}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-green-600"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default DoctorListPage;