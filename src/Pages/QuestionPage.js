import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const BASE_URL = "https://api.elthiumhealth.com";

const QuestionsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [staffId, setStaffId] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittedQuestions, setSubmittedQuestions] = useState(new Set());
  const [slideDirection, setSlideDirection] = useState('slide-in');

  const navigate = useNavigate();

  // Get staffId from localStorage
  useEffect(() => {
    const storedStaffId = localStorage.getItem("staffId");
    if (storedStaffId) {
      setStaffId(storedStaffId);
    } else {
      setError("Staff ID not found in localStorage");
    }
  }, []);

  // Fetch all questions
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/api/admin/questions`)
      .then((res) => {
        if (res.data.data) {
          setQuestions(res.data.data);
        } else {
          setQuestions([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching questions");
        setLoading(false);
      });
  }, []);

  const handleAnswerChange = (answer) => {
    setAnswers((prev) => ({ 
      ...prev, 
      [questions[currentQuestionIndex]._id]: answer 
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setSlideDirection('slide-out');
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setSlideDirection('slide-in');
      }, 300);
    } else {
      // Last question completed, redirect to home
      setSlideDirection('slide-out');
      setTimeout(() => {
        navigate("/");
      }, 500);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setSlideDirection('slide-out-prev');
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev - 1);
        setSlideDirection('slide-in-prev');
      }, 300);
    }
  };

  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestion._id];

    if (!answer || answer.trim() === "") {
      alert("Please provide an answer before submitting.");
      return;
    }

    const payload = {
      userId: staffId,
      questionId: currentQuestion._id,
      answer: answer,
    };

    setLoading(true);
    axios
      .post(`${BASE_URL}/api/staff/submit-questionanswer`, payload)
      .then((res) => {
        // Mark this question as submitted
        setSubmittedQuestions(prev => new Set(prev).add(currentQuestion._id));
        
        // Move to next question after a brief delay
        setTimeout(() => {
          goToNextQuestion();
          setLoading(false);
        }, 800);
      })
      .catch((err) => {
        alert("Error submitting answer");
        setLoading(false);
      });
  };

  const skipQuestion = () => {
    goToNextQuestion();
  };

  // If no questions or all done, show completion
  if (questions.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Done!</h2>
            <p className="text-gray-600 mb-6">No more questions to answer at the moment.</p>
            <button
              onClick={() => navigate("/home")}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors w-full"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        {/* Header */}
        <div className="text-center py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Answer Questions</h1>
          <p className="text-gray-600">Share your thoughts and help us improve</p>
        </div>

        {/* Progress Bar */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          {loading && !currentQuestion ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading questions...</p>
            </div>
          ) : error ? (
            <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : currentQuestion && (
            <div className={`w-full max-w-2xl mx-auto ${slideDirection}`}>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Question Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {currentQuestionIndex + 1}
                        </span>
                      </div>
                      <h2 className="text-white text-xl font-bold">Question</h2>
                    </div>
                    {submittedQuestions.has(currentQuestion._id) && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Submitted
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-8">
                  <div className="mb-2">
                    <h3 className="text-2xl font-semibold text-gray-800 leading-relaxed">
                      {currentQuestion.question}
                    </h3>
                  </div>

                  {/* Answer Input */}
                  <div className="mt-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Your Answer:
                    </label>
                    <textarea
                      value={answers[currentQuestion._id] || ""}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Share your thoughts here..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                      disabled={submittedQuestions.has(currentQuestion._id)}
                    />
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={goToPreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        currentQuestionIndex === 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-white hover:shadow-md"
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <div className="flex space-x-3">
                      <button
                        onClick={skipQuestion}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                      >
                        Skip
                      </button>

                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!answers[currentQuestion._id] || answers[currentQuestion._id].trim() === "" || submittedQuestions.has(currentQuestion._id)}
                        className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                          !answers[currentQuestion._id] || answers[currentQuestion._id].trim() === "" || submittedQuestions.has(currentQuestion._id)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-2 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Submitting...
                          </div>
                        ) : submittedQuestions.has(currentQuestion._id) ? (
                          "Submitted ✓"
                        ) : (
                          `Submit ${currentQuestionIndex === questions.length - 1 ? "& Finish" : "& Next"}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Completion Message (when all questions are done) */}
        {currentQuestionIndex >= questions.length && questions.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">All Questions Completed!</h3>
              <p className="text-gray-600 mb-6">Thank you for sharing your answers. You'll be redirected to the homepage.</p>
              <button
                onClick={() => navigate("/home")}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors w-full"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        .slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        .slide-out {
          animation: slideOut 0.3s ease-in forwards;
        }
        .slide-in-prev {
          animation: slideInPrev 0.3s ease-out forwards;
        }
        .slide-out-prev {
          animation: slideOutPrev 0.3s ease-in forwards;
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s ease-out forwards;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-50px);
          }
        }
        @keyframes slideInPrev {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutPrev {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(50px);
          }
        }
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default QuestionsPage;