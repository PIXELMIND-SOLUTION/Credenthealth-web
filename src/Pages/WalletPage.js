import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowDown } from "react-icons/fa";
import Navbar from "./Navbar";

const WalletPage = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const staffId = localStorage.getItem("staffId");

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!staffId) {
        setError("Staff ID not found!");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://api.credenthealth.com/api/staff/wallet/${staffId}`
        );
        if (response.data) {
          setWalletData(response.data);
        } else {
          setError("No wallet data found");
        }
      } catch (err) {
        setError("Error fetching wallet data");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [staffId]);

  // Helper function to format the "from" field
  const formatFromText = (fromText) => {
    if (!fromText) return "-";
    if (fromText === "Bulk Package Booking") return "Package Booking";
    return fromText;
  };

  if (loading)
    return (
      <div className="text-center text-lg text-gray-600">
        Loading wallet data...
      </div>
    );
  if (error)
    return <div className="text-center text-lg text-red-500">{error}</div>;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="px-4 py-6">
          {/* Wallet Balance */}
          <div className="bg-[#2E67F6] rounded-2xl p-6 mb-6 text-center">
            <p className="text-white text-lg">Total Balance</p>
            <p className="text-white text-4xl font-bold">
              ₹{walletData.wallet_balance}
            </p>
          </div>

          {/* Latest Transactions Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Latest Transactions
            </h2>
            <button className="text-blue-500 text-sm font-semibold hover:underline">
              View all
            </button>
          </div>

          {/* Transaction List */}
          {walletData.transaction_history &&
            walletData.transaction_history.length > 0 ? (
            walletData.transaction_history.map((transaction, index) => (
              <div
                key={index}
                className="bg-white border rounded-xl p-4 mb-3 shadow-sm flex items-start gap-3"
              >
                {/* Left Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100">
                    <FaArrowDown className="text-red-500" />
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Payment</span>
                    <span
                      className={`text-lg font-semibold ${
                        transaction.type === "debit"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {transaction.type === "debit" ? "-" : "+"}₹
                      {transaction.totalAmount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {transaction.time_ago}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatFromText(transaction.from)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No transactions available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;