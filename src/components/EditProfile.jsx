import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import axios from "axios";
import playClickSound from "../utils/ClickSound.js";
import { playDropdownCloseSound } from '../utils/ClickSound.js';
const EditProfile = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.dept || '',
    classRoll: user?.college_roll || '',
    phone: user?.contact_no || ''
  });
  const [image, setImage] = useState(null);
  const [fileError, setFileError] = useState(""); 
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setFileError("File size must be less than 1MB.");
        setSelectedFile(null);
      } else {
        setImage(file)
        setFileError("");
        setSelectedFile(file);
      }
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", user.email);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("classRoll", formData.classRoll);
      formDataToSend.append("phone", formData.phone);
      if (image) {
        formDataToSend.append("image", image);
      }
      const response = await axios.post("http://localhost:3412/update-user", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" } 
      });

      if (response) {
        onUpdate(formData); 
        onClose();
        console.log("Profile updated successfully");
      } else {
        console.error("Failed to update profile:", response.data);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black  bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md relative shadow-lg border border-purple-500/20">
        {/* Close Button */}
        <button 
          onClick={()=>{
            onClose();
            playDropdownCloseSound();
          }} 
          className="absolute top-4 right-4 text-purple-400 hover:text-purple-600 transition-colors"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-purple-200 text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-purple-200 text-sm mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-purple-200 text-sm mb-1">Class Roll</label>
            <input
              type="text"
              name="classRoll"
              value={formData.classRoll}
              onChange={handleChange}
              
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-purple-200 text-sm mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-purple-200 text-sm mb-1">Upload Profile Picture</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="w-full p-2 rounded-lg bg-gray-300 text-gray-900 border border-purple-400"
            />
            <p className="text-xs text-gray-300 pt-1">Max File Size: 1 MB</p>
          </div>
          {preview && (
            <div className="flex justify-center">
              <img src={preview} alt="Profile Preview" className="rounded-full w-24 h-24 object-cover border border-purple-400" />
            </div>
          )}
          
          <div className="flex justify-center px-16">
            {/*<button
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent border border-purple-400 hover:bg-purple-900/30 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>*/}
            <button
              type="submit" onClick={playClickSound}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;