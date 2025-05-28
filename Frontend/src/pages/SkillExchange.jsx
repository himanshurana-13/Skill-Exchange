import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaUserCircle } from 'react-icons/fa';
import { FiFilter, FiEdit2 } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Set axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

const SkillExchange = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfiles, setUserProfiles] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    primarySkill: '',
    description: '',
    lookingFor: []
  });
  const [existingProfiles, setExistingProfiles] = useState([]);

  useEffect(() => {
    // Set up axios interceptor for token
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Fetch all profiles
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/skillprofiles');
      const fetchedProfiles = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched profiles:', fetchedProfiles); // Debug log
      setProfiles(fetchedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Error fetching profiles');
      toast.error('Error fetching profiles');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's profiles
  const fetchUserProfiles = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No auth token found');
      return;
    }

    try {
      const response = await axios.get('/api/skillprofiles/me');
      // Set all user profiles
      const profiles = Array.isArray(response.data) ? response.data : [response.data];
      setUserProfiles(profiles);
      setExistingProfiles(profiles);
      // Reset form data when creating new profile
      setFormData({
        name: '',
        primarySkill: '',
        description: '',
        lookingFor: []
      });
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        toast.error('Please login again');
      } else if (error.response?.status !== 404) {
        console.error('Error fetching user profiles:', error);
        toast.error('Error fetching your profiles');
      }
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchUserProfiles();
  }, [navigate]);

  // Add useEffect for search and category changes
  useEffect(() => {
    console.log('Search query changed:', searchQuery); // Debug log
    console.log('Category changed:', selectedCategory); // Debug log
  }, [searchQuery, selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    // Validate form data
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.primarySkill) {
      toast.error('Please select a primary skill');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      await axios.post('/api/skillprofiles', formData);
      
      toast.success('Profile created successfully');
      setShowProfileModal(false);
      fetchProfiles();
      fetchUserProfiles();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        toast.error('Please login again');
      } else {
        console.error('Error saving profile:', error);
        // Handle validation errors
        if (error.response?.data?.errors) {
          error.response.data.errors.forEach(err => {
            toast.error(err);
          });
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
          // If it's a duplicate profile error, show the user's existing profiles
          if (error.response.data.message.includes('already have a profile')) {
            fetchUserProfiles();
          }
        } else {
          toast.error('Error saving profile. Please try again.');
        }
      }
    }
  };

  const handleLookingForChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(skill)
        ? prev.lookingFor.filter(s => s !== skill)
        : [...prev.lookingFor, skill]
    }));
  };

  const handleProposeExchange = async (profile) => {
    if (!localStorage.getItem('token')) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    setSelectedProfile(profile);
    setShowExchangeModal(true);
  };

  const submitExchangeProposal = async () => {
    try {
      // Here you would typically make an API call to save the exchange proposal
      await axios.post('/api/exchanges', {
        recipientId: selectedProfile._id,
        message: `I would like to exchange skills with you. I can offer help with ${userProfiles[0]?.primarySkill}.`
      });
      
      toast.success('Exchange proposal sent successfully!');
      setShowExchangeModal(false);
    } catch (error) {
      console.error('Error sending proposal:', error);
      toast.error('Failed to send exchange proposal. Please try again.');
    }
  };

  // Update the filter logic
  const filteredProfiles = React.useMemo(() => {
    console.log('Filtering profiles...'); // Debug log
    return Array.isArray(profiles) ? profiles.filter(profile => {
      if (!profile) return false;
      
      // Skip profiles that belong to the current user
      const isCurrentUserProfile = existingProfiles.some(ep => ep._id === profile._id);
      if (isCurrentUserProfile) return false;
      
      // Search query matching
      const searchTerms = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchTerms || 
        profile.name?.toLowerCase().includes(searchTerms) ||
        profile.primarySkill?.toLowerCase().includes(searchTerms) ||
        profile.description?.toLowerCase().includes(searchTerms) ||
        profile.lookingFor?.some(skill => skill.toLowerCase().includes(searchTerms));
      
      // Category matching
      const matchesCategory = 
        selectedCategory === 'All Categories' || 
        profile.primarySkill === selectedCategory ||
        profile.lookingFor?.includes(selectedCategory);
      
      const result = matchesSearch && matchesCategory;
      return result;
    }) : [];
  }, [profiles, searchQuery, selectedCategory, existingProfiles]);

  // Update the search input handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log('Search input changed:', value); // Debug log
    setSearchQuery(value);
  };

  // Update the category select handler
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    console.log('Category selected:', value); // Debug log
    setSelectedCategory(value);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search and Filter Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-white pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-500"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="All Categories">All Categories</option>
            <option value="Web Development">Web Development</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Content Writing">Content Writing</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="UI/UX Design">UI/UX Design</option>
          </select>
          <FiFilter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={() => {
            if (!localStorage.getItem('token')) {
              toast.error('Please login first');
              navigate('/login');
              return;
            }
            setShowProfileModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Create New Profile
        </button>
      </div>

      {/* Show existing profiles if any */}
      {existingProfiles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Existing Profiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {existingProfiles.map((profile) => (
              <div key={profile._id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      <FaUserCircle className="w-full h-full text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                      <p className="text-base text-indigo-600">{profile.primarySkill}</p>
                    </div>
                  </div>
                  {profile.featured && (
                    <FaStar className="text-yellow-400 text-xl" />
                  )}
                </div>

                <p className="text-gray-600 text-base mt-4 mb-4">
                  {profile.description}
                </p>

                <div>
                  <p className="text-gray-500 text-base mb-2">Looking for:</p>
                  <div className="flex flex-wrap gap-2">
                    {(profile.lookingFor || []).map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleProposeExchange(profile)}
                  className="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors text-base font-medium"
                >
                  Propose Exchange
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No profiles found
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <div key={profile._id} className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <FaUserCircle className="w-full h-full text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                    <p className="text-base text-indigo-600">{profile.primarySkill}</p>
                  </div>
                </div>
                {profile.featured && (
                  <FaStar className="text-yellow-400 text-xl" />
                )}
              </div>

              <p className="text-gray-600 text-base mt-4 mb-4">
                {profile.description}
              </p>

              <div>
                <p className="text-gray-500 text-base mb-2">Looking for:</p>
                <div className="flex flex-wrap gap-2">
                  {(profile.lookingFor || []).map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleProposeExchange(profile)}
                className="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors text-base font-medium"
              >
                Propose Exchange
              </button>
            </div>
          ))
        )}
      </div>

      {/* Exchange Proposal Modal */}
      {showExchangeModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Propose Skill Exchange
              </h2>
              <button
                onClick={() => setShowExchangeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">
                You are proposing to exchange skills with <span className="font-semibold">{selectedProfile.name}</span>
              </p>
              <div className="mt-4">
                <p className="font-medium">Their Skills:</p>
                <p className="text-indigo-600">{selectedProfile.primarySkill}</p>
                <p className="font-medium mt-2">Looking for:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedProfile.lookingFor.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowExchangeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitExchangeProposal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Create New Profile
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Skill <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.primarySkill}
                  onChange={(e) => setFormData(prev => ({ ...prev, primarySkill: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select your primary skill</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Content Writing">Content Writing</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="4"
                  placeholder="Describe your skills and experience"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 500 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills You're Looking For
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Web Development', 'Graphic Design', 'Content Writing', 'Digital Marketing', 'UI/UX Design'].map((skill) => (
                    <label key={skill} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.lookingFor.includes(skill)}
                        onChange={() => handleLookingForChange(skill)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillExchange; 