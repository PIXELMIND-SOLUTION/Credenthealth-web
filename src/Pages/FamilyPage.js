import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaPlus, FaUser, FaEdit, FaTrash } from "react-icons/fa";

const FamilyPage = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [newFamilyMember, setNewFamilyMember] = useState({
    fullName: "",
    mobileNumber: "",
    age: "",
    gender: "",
    DOB: "",
    height: "",
    weight: "",
    eyeSight: "",
    BMI: "",
    BP: "",
    relation: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [ageManuallyEdited, setAgeManuallyEdited] = useState(false);

  // Retrieve staffId from localStorage
  const staffId = localStorage.getItem("staffId");

  useEffect(() => {
    if (staffId) {
      // Fetch all family members
      axios
        .get(`https://api.elthiumhealth.com/api/staff/getallfamily/${staffId}`)
        .then((response) => {
          setFamilyMembers(response.data.family_members);
          setLoading(false);
        })
        .catch(() => {
          setError("Error fetching family members");
          setLoading(false);
        });
    } else {
      setError("No staffId found in localStorage");
      setLoading(false);
    }
  }, [staffId]);

  // Function to calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return "";
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for DOB
    if (name === "DOB") {
      const calculatedAge = calculateAge(value);
      setNewFamilyMember({
        ...newFamilyMember,
        DOB: value,
        age: ageManuallyEdited ? newFamilyMember.age : calculatedAge
      });
    } 
    // Special handling for age
    else if (name === "age") {
      setAgeManuallyEdited(true);
      setNewFamilyMember({
        ...newFamilyMember,
        age: value
      });
    }
    // All other fields
    else {
      setNewFamilyMember({
        ...newFamilyMember,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editMode && selectedMember) {
      // Update family member API call
      axios
        .put(
          `https://api.elthiumhealth.com/api/staff/updatefamily/${staffId}/${selectedMember._id}`,
          newFamilyMember
        )
        .then((response) => {
          const updatedFamilyMembers = familyMembers.map((member) =>
            member._id === selectedMember._id
              ? response.data.family_member
              : member
          );
          setFamilyMembers(updatedFamilyMembers);
          resetForm();
        })
        .catch(() => setError("Error updating family member"));
    } else {
      // Add new family member API call
      axios
        .post(
          `https://api.elthiumhealth.com/api/staff/create-family/${staffId}`,
          newFamilyMember
        )
        .then((response) => {
          setFamilyMembers([...familyMembers, response.data.family_member]);
          resetForm();
        })
        .catch(() => setError("Error adding family member"));
    }
  };

  const resetForm = () => {
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
      BMI: "",
      BP: "",
      description: ""
    });
    setEditMode(false);
    setSelectedMember(null);
    setIsFormVisible(false);
    setAgeManuallyEdited(false);
  };

  const handleEdit = (member) => {
    setNewFamilyMember({
      fullName: member.fullName,
      mobileNumber: member.mobileNumber,
      age: member.age,
      gender: member.gender,
      DOB: member.DOB ? member.DOB.split('T')[0] : "", // Format date for input
      height: member.height,
      weight: member.weight,
      relation: member.relation,
      eyeSight: member.eyeSight,
      BMI: member.BMI,
      BP: member.BP,
      description: member.description
    });
    setEditMode(true);
    setSelectedMember(member);
    setIsFormVisible(true);
    setAgeManuallyEdited(true); // Assume age came from DB, so don't auto-override
  };

  const handleRemove = (memberId) => {
    axios
      .delete(
        `https://api.elthiumhealth.com/api/staff/removefamily/${staffId}/${memberId}`
      )
      .then(() => {
        setFamilyMembers(
          familyMembers.filter((member) => member._id !== memberId)
        );
      })
      .catch(() => setError("Error removing family member"));
  };

  const genderOptions = ["Male", "Female", "Other"];
  const relationOptions = [
    "Spouse",
    "Wife",
    "Husband",
    "Son",
    "Daughter",
    "Father",
    "Mother",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <div className="flex-grow px-4 py-6">
          {!isFormVisible ? (
            <>
              {/* List Page */}
              <h2 className="text-xl font-bold mb-6">Family Members</h2>
              {error && (
                <p className="text-red-500 text-center mb-4">{error}</p>
              )}

              {/* Add button */}
              <button
                onClick={() => setIsFormVisible(true)}
                className="flex items-center border border-blue-500 bg-white text-blue-500 py-3 px-4 rounded-lg w-full mb-6 font-medium"
              >
                <div className="bg-blue-500 text-white p-2 rounded-full mr-2 flex items-center justify-center">
                  <FaPlus size={16} />
                </div>
                Add your family members
              </button>

              {/* Members List */}
              {loading && (
                <p className="text-center text-gray-600">Loading...</p>
              )}
              {familyMembers.length === 0 && !loading && (
                <p className="text-center text-gray-600">
                  No family members found.
                </p>
              )}

              <div className="space-y-4">
                {familyMembers.map((member) => (
                  <div
                    key={member._id}
                    className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <FaUser size={30} className="text-blue-500" />
                      <div>
                        <p className="font-bold text-gray-800">
                          {member.fullName}
                        </p>
                        <p className="text-gray-600">
                          {member.relation} | Age: {member.age} | {member.gender}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleRemove(member._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Form Page */}
              <h2 className="text-xl font-bold mb-6">
                {editMode ? "Edit Family Member" : "Add Your Family Members"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  value={newFamilyMember.fullName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full p-3 border rounded"
                  required
                />

                <select
                  name="relation"
                  value={newFamilyMember.relation}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded"
                  required
                >
                  <option value="">Select Relation</option>
                  {relationOptions.map((relation) => (
                    <option key={relation} value={relation}>
                      {relation}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  name="mobileNumber"
                  value={newFamilyMember.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Mobile Number"
                  className="w-full p-3 border rounded"
                />

                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <input
                      type="date"
                      name="DOB"
                      value={newFamilyMember.DOB}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Date of Birth (Auto-calculates age)
                    </p>
                  </div>
                  <div className="w-1/2">
                    <input
                      type="number"
                      name="age"
                      value={newFamilyMember.age}
                      onChange={handleInputChange}
                      placeholder="Age (Auto or Manual)"
                      className="w-full p-3 border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter manually or auto from DOB
                    </p>
                  </div>
                </div>

                <select
                  name="gender"
                  value={newFamilyMember.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded"
                >
                  <option value="">Gender</option>
                  {genderOptions.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>

                <div className="flex space-x-4">
                  <input
                    type="number"
                    name="height"
                    value={newFamilyMember.height}
                    onChange={handleInputChange}
                    placeholder="Height (cm)"
                    className="w-1/2 p-3 border rounded"
                  />
                  <input
                    type="number"
                    name="weight"
                    value={newFamilyMember.weight}
                    onChange={handleInputChange}
                    placeholder="Weight (kg)"
                    className="w-1/2 p-3 border rounded"
                  />
                </div>

                <div className="flex space-x-4">
                  <input
                    type="text"
                    name="eyeSight"
                    value={newFamilyMember.eyeSight}
                    onChange={handleInputChange}
                    placeholder="Eye Sight"
                    className="w-1/3 p-3 border rounded"
                  />
                  <input
                    type="number"
                    name="BMI"
                    value={newFamilyMember.BMI}
                    onChange={handleInputChange}
                    placeholder="BMI"
                    className="w-1/3 p-3 border rounded"
                  />
                  <input
                    type="text"
                    name="BP"
                    value={newFamilyMember.BP}
                    onChange={handleInputChange}
                    placeholder="BP"
                    className="w-1/3 p-3 border rounded"
                  />
                </div>

                <textarea
                  name="description"
                  value={newFamilyMember.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="w-full p-3 border rounded"
                  rows="3"
                ></textarea>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 rounded-lg"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg mt-2"
                >
                  Cancel
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyPage;