import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSkillProfile, updateSkillProfile, uploadPortfolioItem, deletePortfolioItem } from '../services/skillProfileService';
import { toast } from 'react-toastify';
import axios from "axios";
import { 
  DocumentIcon, 
  PhotoIcon, 
  TrashIcon, 
  ArrowUpTrayIcon,
  DocumentTextIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SkillProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    primarySkill: '',
    description: '',
    lookingFor: [],
    portfolio: []
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/skillprofiles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.profile) {
        setFormData(response.data.profile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLookingForChange = (e) => {
    const options = e.target.options;
    const values = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    setFormData({
      ...formData,
      lookingFor: values
    });
  };

  const handlePortfolioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("title", file.name);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/skillprofiles/portfolio`, uploadFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setFormData(prevData => ({
        ...prevData,
        portfolio: [...prevData.portfolio, response.data.portfolioItem]
      }));
      
      toast.success("Portfolio sample uploaded successfully");
    } catch (error) {
      console.error("Error uploading portfolio sample:", error);
      toast.error(error.response?.data?.message || "Failed to upload portfolio sample");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePortfolioItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/skillprofiles/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData({
        ...formData,
        portfolio: formData.portfolio.filter(item => item._id !== id)
      });
      
      toast.success("Portfolio sample deleted successfully");
    } catch (error) {
      console.error("Error deleting portfolio sample:", error);
      toast.error("Failed to delete portfolio sample");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.primarySkill || !formData.description) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not logged in. Please log in again.");
        navigate("/login");
        return;
      }

      // Make sure lookingFor is an array
      const dataToSubmit = {
        ...formData,
        lookingFor: Array.isArray(formData.lookingFor) ? formData.lookingFor : []
      };

      // Log the data being sent
      console.log("Submitting profile data:", dataToSubmit);
      console.log("Token:", token.substring(0, 10) + "...");

      const response = await axios.post(`${API_URL}/skillprofiles`, dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Profile update response:", response.data);
      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Log detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        const errorMessage = error.response.data.message || "Failed to update profile";
        toast.error(errorMessage);
        
        // If unauthorized, redirect to login
        if (error.response.status === 401) {
          navigate("/login");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        toast.error("Network error. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="h-6 w-6 text-blue-500" />;
      case 'pdf':
        return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
      case 'document':
        return <DocumentChartBarIcon className="h-6 w-6 text-green-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Skill Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Skill</label>
            <select
              name="primarySkill"
              value={formData.primarySkill || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Primary Skill</option>
              <option value="Web Development">Web Development</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Content Writing">Content Writing</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Data Analysis">Data Analysis</option>
              <option value="Video Editing">Video Editing</option>
              <option value="Social Media Management">Social Media Management</option>
              <option value="SEO Optimization">SEO Optimization</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Looking For</label>
            <select
              multiple
              value={formData.lookingFor || []}
              onChange={handleLookingForChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Web Development">Web Development</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Content Writing">Content Writing</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Data Analysis">Data Analysis</option>
              <option value="Video Editing">Video Editing</option>
              <option value="Social Media Management">Social Media Management</option>
              <option value="SEO Optimization">SEO Optimization</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple skills</p>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.portfolio && formData.portfolio.map((item, index) => (
              <div key={item._id || `portfolio-item-${index}`} className="border rounded-lg p-4 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getFileIcon(item.type)}
                    <span className="ml-2 font-medium truncate">{item.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePortfolioItem(item._id)}
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                {item.type === 'image' && (
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="mt-2 w-full h-32 object-cover rounded"
                  />
                )}
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Upload Portfolio Sample</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handlePortfolioUpload}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, PDF, DOC up to 5MB
                </p>
                {uploading && (
                  <div className="mt-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SkillProfileForm; 