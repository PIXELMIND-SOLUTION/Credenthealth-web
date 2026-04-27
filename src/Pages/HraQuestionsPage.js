import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const BASE_URL = "https://api.elthiumhealth.com";

const HraQuestionsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [staffId, setStaffId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Get gender from localStorage
  const gender = localStorage.getItem("gender");

  // Fetch all questions first, then extract categories from questions
  useEffect(() => {
    if (!staffId) return;

    setLoading(true);
    setError("");

    axios
      .get(`${BASE_URL}/api/admin/hra-questions`)
      .then((res) => {
        console.log("All Questions API Response:", res.data);
        if (res.data.hraQuestions && res.data.hraQuestions.length > 0) {
          const filteredQuestions = filterQuestionsByGender(res.data.hraQuestions);
          setAllQuestions(filteredQuestions);
          setFilteredQuestions(filteredQuestions);
          
          // Extract unique categories from questions
          const uniqueCategories = extractCategoriesFromQuestions(filteredQuestions);
          setCategories(uniqueCategories);
          
          setCurrentIndex(0);
          setError("");
        } else {
          setAllQuestions([]);
          setFilteredQuestions([]);
          setCategories([{ displayName: "All", originalName: "All" }]);
          setError("No questions found");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("All questions fetch error:", err);
        setError(`Error loading questions: ${err.message}`);
        setAllQuestions([]);
        setFilteredQuestions([]);
        setCategories([{ displayName: "All", originalName: "All" }]);
        setLoading(false);
      });
  }, [staffId, gender]);

  // Extract unique categories from questions
  const extractCategoriesFromQuestions = (questions) => {
    const categorySet = new Set();
    
    questions.forEach(question => {
      if (question.hraCategoryName && question.hraCategoryName.trim()) {
        categorySet.add(question.hraCategoryName.trim());
      }
    });

    const categoryArray = Array.from(categorySet).map(catName => ({
      displayName: catName,
      originalName: catName
    }));

    return [{ displayName: "All", originalName: "All" }, ...categoryArray];
  };

  // Filter questions based on gender
  const filterQuestionsByGender = (questions) => {
    return questions.filter((question) => {
      if (!question.gender || question.gender === "Unknown" || question.gender === "Both") {
        return true;
      }
      if (gender === "Male" && question.gender === "Female") {
        return false;
      }
      if (gender === "Female" && question.gender === "Male") {
        return false;
      }
      return true;
    });
  };

  // Frontend filtering based on selected category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredQuestions(allQuestions);
    } else {
      const filtered = allQuestions.filter(question => 
        question.hraCategoryName && 
        question.hraCategoryName.trim() === selectedCategory
      );
      setFilteredQuestions(filtered);
    }
    setCurrentIndex(0);
  }, [selectedCategory, allQuestions]);

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === 0) {
      alert("Please answer at least one question before submitting.");
      return;
    }

    const formattedAnswers = Object.keys(answers).map((qId) => ({
      questionId: qId,
      selectedOption: answers[qId],
    }));

    const payload = { staffId, answers: formattedAnswers };

    console.log("Submitting payload:", payload);

    axios
      .post(`${BASE_URL}/api/staff/submit-hra-answers`, payload)
      .then((res) => {
        console.log("Submit Response:", res.data);
        
        const responseData = res.data.data || {};
        const resultData = {
          totalPoints: responseData.totalPoints || res.data.totalPoints || 0,
          riskLevel: responseData.riskLevel || res.data.riskLevel || "Unknown",
          riskMessage: responseData.riskMessage || res.data.riskMessage || "No risk message available",
          score: responseData.score || responseData.totalPoints || res.data.totalPoints || 0,
          totalQuestions: filteredQuestions.length,
          answeredQuestions: Object.keys(answers).length,
          categoryPoints: responseData.categoryPoints || {},
          prescribedForCategories: responseData.prescribedForCategories || {},
          message: res.data.message || "Assessment completed successfully"
        };

        console.log("Processed Result Data:", resultData);
        navigate("/hra-result", { state: resultData });
      })
      .catch((err) => {
        console.error("Submit Error:", err.response?.data || err);
        alert(`Error: ${err.response ? err.response.data.message : err.message}`);
      });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-4 text-black">HRA</h2>
          <p className="text-lg font-semibold text-center mb-6">Health Risk Assessment</p>

          {/* Dropdown */}
          {categories.length > 0 && (
            <div className="flex justify-center mb-6">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 w-full max-w-xs"
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat.originalName}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Category Info */}
          {selectedCategory !== "All" && filteredQuestions.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-center">
              Showing questions for: <strong>{selectedCategory}</strong>
              <br />
            </div>
          )}

          {/* Questions */}
          {loading ? (
            <div className="text-center">
              <p>Loading questions...</p>
            </div>
          ) : filteredQuestions.length > 0 ? (
            <div>
              {/* Progress */}
              <div className="text-center mb-6">
                <p className="font-medium mb-2">
                  Question {currentIndex + 1} of {filteredQuestions.length}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Answered: {Object.keys(answers).length} / {filteredQuestions.length}
                </p>
              </div>

              {/* Single Question */}
              <div className="border rounded-lg p-6 mb-6 bg-white shadow-sm">
                <h3 className="font-semibold mb-4 text-lg">
                  {currentIndex + 1}. {filteredQuestions[currentIndex].question}
                </h3>
                <div className="space-y-3">
                  {filteredQuestions[currentIndex].options.map((opt) => (
                    <label
                      key={opt._id}
                      className={`flex items-center space-x-3 border rounded-lg px-4 py-3 cursor-pointer transition-all ${
                        answers[filteredQuestions[currentIndex]._id] === opt._id
                          ? "bg-blue-50 border-blue-500"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${filteredQuestions[currentIndex]._id}`}
                        checked={answers[filteredQuestions[currentIndex]._id] === opt._id}
                        onChange={() => {
                          handleAnswerSelect(filteredQuestions[currentIndex]._id, opt._id);
                        }}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex-1">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    currentIndex === 0
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Previous
                </button>

                {currentIndex === filteredQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length === 0}
                    className={`px-6 py-2 rounded-md transition-colors ${
                      Object.keys(answers).length === 0
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          ) : (
            !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No questions found.</p>
                <p className="text-gray-400 mt-2">
                  {selectedCategory === "All" 
                    ? "Please try refreshing the page." 
                    : `No questions found for "${selectedCategory}" category.`}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HraQuestionsPage;