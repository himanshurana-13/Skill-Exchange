import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FunnelIcon, 
  ArrowsUpDownIcon,
  ClockIcon,
  TagIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { isAuthenticated } from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RequestCard = ({ request, onClick }) => {
  // Get the skills from the request
  const neededSkill = request.skills?.needed || '';
  const offeredSkill = request.skills?.offered || '';

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden cursor-pointer transform hover:-translate-y-1"
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2">
              {request.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Posted by {request.name}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${request.status === 'open' ? 'bg-green-100 text-green-800' :
              request.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'}`}>
            {request.status || 'open'}
          </span>
        </div>
        
        <p className="mt-4 text-sm text-gray-600 line-clamp-2">{request.description}</p>

        <div className="mt-4 space-y-2">
          <div>
            <p className="text-xs font-medium text-red-500 mb-1">Needs:</p>
            <div className="flex flex-wrap gap-2">
              {neededSkill ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                  <TagIcon className="mr-1 h-3 w-3" />
                  {neededSkill}
                </span>
              ) : (
                <span className="text-xs text-gray-500">No skills needed specified</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-green-500 mb-1">Offers:</p>
            <div className="flex flex-wrap gap-2">
              {offeredSkill ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  <TagIcon className="mr-1 h-3 w-3" />
                  {offeredSkill}
                </span>
              ) : (
                <span className="text-xs text-gray-500">No skills offered specified</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {new Date(request.date).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            {request.responses?.length || 0} responses
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
      ${active 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
  >
    {children}
  </button>
);

const RecentRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/service-requests`);
        setRequests(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(err.response?.data?.message || "Failed to fetch requests");
        setLoading(false);
      }
    };
    fetchRequests();
  }, [navigate]);

  const handleViewAllRequests = () => {
    navigate('/requests');
  };

  const handleRequestClick = (requestId) => {
    navigate(`/requests/${requestId}`);
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' }
  ];

  const sortOptions = [
    { id: 'latest', label: 'Latest' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'responses', label: 'Most Responses' }
  ];

  const filteredRequests = requests
    .filter(request => activeFilter === 'all' || request.status === activeFilter)
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'popular') {
        return (b.views || 0) - (a.views || 0);
      } else {
        return (b.responses?.length || 0) - (a.responses?.length || 0);
      }
    })
    .slice(0, 4);

  if (loading) {
    return (
      <section className="bg-gray-100 py-6 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-100 py-6 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-500">Error loading requests: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-100 py-6 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Recent Requests</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-500">
            Browse the latest skill exchange opportunities
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            {filters.map(filter => (
              <FilterButton
                key={filter.id}
                active={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </FilterButton>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowsUpDownIcon className="h-5 w-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onClick={() => handleRequestClick(request._id)}
            />
          ))}

          {filteredRequests.length === 0 && (
            <div className="col-span-1 sm:col-span-2 text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="inline-block rounded-full bg-gray-100 p-3 mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500">No requests found matching your filters</p>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleViewAllRequests}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            View All Requests
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentRequests;
