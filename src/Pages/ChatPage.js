import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Navbar from './Navbar';

// Replace with your actual backend URL
const SOCKET_URL = 'https://api.elthiumhealth.com';
const socket = io(SOCKET_URL);

const ChatPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [file, setFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [doctorName, setDoctorName] = useState('Doctor');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch the staff ID from localStorage
  useEffect(() => {
    const storedStaffId = localStorage.getItem('staffId');
    if (!storedStaffId) {
      setError('Staff ID is not available in localStorage.');
      return;
    }
    setStaffId(storedStaffId);
  }, []);

  // Fetch the doctors based on staff's booking
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!staffId) return;

      try {
        const response = await axios.get(
          `https://api.elthiumhealth.com/api/staff/mybookings/${staffId}`
        );

        console.log('Doctors API Response:', response.data); // Add this for debugging

        if (response.data.success && response.data.bookings.length > 0) {
          // Extract unique doctors from bookings
          const uniqueDoctors = response.data.bookings.reduce((acc, booking) => {
            const doctor = booking.doctorId;

            // Check if doctor exists and has valid _id
            if (doctor && doctor._id && !acc.find(d => d._id === doctor._id)) {
              acc.push(doctor);
            }
            return acc;
          }, []);

          console.log('Extracted doctors:', uniqueDoctors); // Add this for debugging
          setDoctors(uniqueDoctors);
        } else {
          setError('No doctors found for this staff.');
        }
      } catch (err) {
        console.error('Error fetching doctors:', err); // Add detailed error logging
        setError('Error fetching doctors: ' + (err.response?.data?.message || err.message));
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, [staffId]);

  // Select a doctor to chat with
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorId(doctor._id);
    setDoctorName(doctor.name);
  };

  console.log(staffId, doctorId)

  // Fetch chat history when the doctorId and staffId are available
  useEffect(() => {
    if (!doctorId || !staffId) return;

    setLoading(true);
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(
          `https://api.elthiumhealth.com/api/staff/getchat/${staffId}/${doctorId}`
        );

        if (response.data.success) {
          setMessages(response.data.messages);
        } else {
          setError('No chat history found.');
        }
      } catch (err) {
        setError('Error fetching chat history.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();

    // Join the socket room for real-time chat
    socket.emit('joinRoom', { staffId, doctorId });

    // Listen for incoming messages
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for typing indicator
    socket.on('typing', (senderId) => {
      if (senderId !== staffId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    // Clean up the listener on component unmount
    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
    };
  }, [staffId, doctorId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return;

    const messageData = {
      staffId,
      doctorId,
      message: newMessage,
      senderType: 'staff',
    };

    // If file is present, include it
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message', newMessage);
      formData.append('senderType', 'staff');

      try {
        const response = await axios.post(
          `https://api.elthiumhealth.com/api/staff/sendchat/${staffId}/${doctorId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (response.data.success) {
          socket.emit('sendMessage', response.data.chat);
          setFile(null);
          setNewMessage('');
        } else {
          setError('Failed to send message.');
        }
      } catch (err) {
        console.error('Error while sending message:', err);
        setError('Error sending message.');
      }
    } else {
      try {
        // Send text message only
        const response = await axios.post(
          `https://api.elthiumhealth.com/api/staff/sendchat/${staffId}/${doctorId}`,
          messageData
        );

        if (response.data.success) {
          socket.emit('sendMessage', response.data.chat);
          setNewMessage('');
        } else {
          setError('Failed to send message.');
        }
      } catch (err) {
        console.error('Error while sending message:', err);
        setError('Error sending message.');
      }
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      // Auto-send file if no message text
      if (!newMessage.trim()) {
        setTimeout(() => handleSendMessage(), 100);
      }
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    socket.emit('typing', staffId);
  };

  // Handle pressing Enter to send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Remove file from message
  const removeFile = () => {
    setFile(null);
  };

  // Go back to doctors list
  const handleBackToDoctors = () => {
    setSelectedDoctor(null);
    setDoctorId(null);
    setMessages([]);
  };

  return (
    // Doctors list with Back Arrow
    <div className="flex-1 overflow-y-auto">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">

        {/* If no doctor is selected, show the list of doctors */}
        {!selectedDoctor ? (
          <div className="flex-1 overflow-y-auto p-4">
            {doctorsLoading ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">Loading doctors...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-blue-900">{error}</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">No doctors found. You need to have a booking with a doctor first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSelectDoctor(doctor)}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialization || 'General Doctor'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center">
              <button
                onClick={handleBackToDoctors}
                className="mr-2 p-1 rounded-full hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold mr-3">
                {doctorName.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold">{doctorName}</h2>
                {isTyping && (
                  <p className="text-xs text-blue-200">typing...</p>
                )}
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 bg-chat-background bg-opacity-5">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">Loading chat history...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex mb-4 ${msg.senderId === staffId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-lg p-3 ${msg.senderId === staffId
                          ? 'bg-blue-100 rounded-br-none'
                          : 'bg-white rounded-bl-none'
                        }`}
                    >
                      {msg.senderId !== staffId && (
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          {msg.sender || 'Doctor'}
                        </p>
                      )}
                      {msg.message && (
                        <p className="text-gray-800">{msg.message}</p>
                      )}
                      {msg.file && (
                        <div className="mt-2">
                          <a
                            href={msg.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-500 hover:underline"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            View File
                          </a>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-300 p-3">
              {file && (
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded-md mb-2">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                  </div>
                  <button onClick={removeFile} className="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex items-center">
                <label htmlFor="file-upload" className="cursor-pointer mr-2 text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 bg-gray-100 rounded-full mr-2">
                  <textarea
                    className="w-full bg-transparent border-none focus:outline-none p-3 resize-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      handleTyping();
                      handleKeyPress(e);
                    }}
                    placeholder="Type a message"
                    rows="1"
                  ></textarea>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && !file}
                  className={`p-3 rounded-full ${newMessage.trim() || file ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'
                    } text-white`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;