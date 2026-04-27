import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaCalendarAlt, FaFileAlt } from "react-icons/fa";

// Function to calculate "time ago"
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval > 1 ? "s" : ""} ago`;

  return "Just now";
};

const NotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [staffId, setStaffId] = useState(null);

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
      axios
        .get(`https://api.elthiumhealth.com/api/staff/notifications/${staffId}`)
        .then((response) => {
          if (response.data.notifications) {
            setNotifications(response.data.notifications);
          } else {
            setNotifications([]);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch notifications. Please try again later.");
          setLoading(false);
        });
    }
  }, [staffId]);

  // Different icons (with colored transparent background)
  const getIcon = (title) => {
    if (title.toLowerCase().includes("consultation")) {
      return (
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100">
          <FaCalendarAlt className="text-blue-500 text-xl" />
        </div>
      );
    }
    if (title.toLowerCase().includes("diagnostic")) {
      return (
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100">
          <FaFileAlt className="text-orange-500 text-xl" />
        </div>
      );
    }
    if (title.toLowerCase().includes("package")) {
      return (
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100">
          <FaFileAlt className="text-orange-500 text-xl" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
        <FaFileAlt className="text-gray-500 text-xl" />
      </div>
    );
  };

  const renderNotifications = () => {
    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    if (notifications.length > 0) {
      return (
        <div className="space-y-3">
          {notifications.slice().reverse().map((notification, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow p-4 flex items-start space-x-3"
            >
              {/* Left Icon */}
              {getIcon(notification.title)}

              {/* Text Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {notification.title}
                </h3>
                <p className="text-gray-700 text-sm">{notification.message}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {timeAgo(notification.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center p-10">
          <h3 className="text-lg font-medium text-gray-700">
            No Notifications
          </h3>
          <p className="text-gray-500 text-sm text-center mt-1">
            You have no new notifications at the moment.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-center mb-4">Notifications</h2>
          {renderNotifications()}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;