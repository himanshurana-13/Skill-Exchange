import React, { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  PhotoIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';
import { getReviews, addReview } from '../services/reviewService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    primarySkill: '',
    description: '',
    lookingFor: [],
    portfolio: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioPreview, setPortfolioPreview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Available skills for selection
  const availableSkills = [
    'Web Development', 
    'Graphic Design', 
    'Content Writing', 
    'Digital Marketing', 
    'UI/UX Design',
    'Mobile Development',
    'Data Analysis',
    'Video Editing',
    'Social Media Management',
    'SEO Optimization'
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          return;
        }

        const response = await axios.get(`${API_URL}/skillprofiles`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUser(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          primarySkill: response.data.primarySkill || '',
          description: response.data.description || '',
          lookingFor: response.data.lookingFor || [],
          portfolio: response.data.portfolio || []
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
    loadReviews();
  }, [reviewsPage]);

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await getReviews(user._id, reviewsPage);
      setReviews(response.reviews);
      setTotalReviews(response.totalReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSkillAdd = () => {
    if (newSkill && !formData.lookingFor.includes(newSkill)) {
      setFormData({
        ...formData,
        lookingFor: [...formData.lookingFor, newSkill]
      });
      setNewSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData({
      ...formData,
      lookingFor: formData.lookingFor.filter(skill => skill !== skillToRemove)
    });
  };

  const handlePortfolioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortfolioFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioUpload = async () => {
    if (!portfolioFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', portfolioFile);

      const response = await axios.post(`${API_URL}/skillprofiles/portfolio`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, response.data.url]
      }));
      setPortfolioFile(null);
      setPortfolioPreview('');
      toast.success('Portfolio item uploaded successfully');
    } catch (error) {
      console.error('Error uploading portfolio item:', error);
      toast.error('Failed to upload portfolio item');
    } finally {
      setSaving(false);
    }
  };

  const handlePortfolioRemove = async (index) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/skillprofiles/portfolio/${index}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setFormData(prev => ({
        ...prev,
        portfolio: prev.portfolio.filter((_, i) => i !== index)
      }));
      toast.success('Portfolio item removed successfully');
    } catch (error) {
      console.error('Error removing portfolio item:', error);
      toast.error('Failed to remove portfolio item');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/skillprofiles`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await addReview(user._id, reviewData);
      setReviews(prevReviews => [response.review, ...prevReviews]);
      setTotalReviews(prev => prev + 1);
      setUser(prev => ({
        ...prev,
        rating: response.newRating
      }));
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <UserCircleIcon className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-500">Manage your skills and portfolio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Skill</label>
            <select
              name="primarySkill"
              value={formData.primarySkill}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a primary skill</option>
              {availableSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills You're Looking For</label>
            <div className="flex mb-2">
              <select
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a skill</option>
                {availableSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSkillAdd}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.lookingFor.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(skill)}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {formData.portfolio.map((item, index) => (
                <div key={index} className="relative group">
                  <img
                    src={item}
                    alt={`Portfolio Item ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handlePortfolioRemove(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <input
                type="file"
                onChange={handlePortfolioChange}
                className="hidden"
                id="portfolio-upload"
                accept="image/*"
              />
              <label
                htmlFor="portfolio-upload"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200"
              >
                <PhotoIcon className="h-5 w-5 inline-block mr-1" />
                Upload Image
              </label>
              {portfolioFile && (
                <button
                  type="button"
                  onClick={handlePortfolioUpload}
                  className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              )}
            </div>
            {portfolioPreview && (
              <div className="mt-4">
                <img
                  src={portfolioPreview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Rating Summary */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Reviews</h2>
          <div className="flex items-center">
            <StarRating rating={user.rating} readonly size="lg" />
            <span className="ml-2 text-lg font-medium">
              {user.rating.toFixed(1)} ({totalReviews} reviews)
            </span>
          </div>
        </div>

        {/* Review Form */}
        {user._id !== localStorage.getItem('userId') && (
          <div className="mb-8">
            <ReviewForm onSubmit={handleReviewSubmit} profileId={user._id} />
          </div>
        )}

        {/* Reviews List */}
        <div className="mt-8">
          {loadingReviews ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <ReviewsList reviews={reviews} />
          )}
        </div>

        {/* Pagination */}
        {totalReviews > 10 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setReviewsPage(prev => Math.max(1, prev - 1))}
              disabled={reviewsPage === 1}
              className="px-4 py-2 border rounded-l-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setReviewsPage(prev => prev + 1)}
              disabled={reviewsPage * 10 >= totalReviews}
              className="px-4 py-2 border rounded-r-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 