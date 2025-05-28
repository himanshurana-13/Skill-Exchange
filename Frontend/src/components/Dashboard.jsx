import React, { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  BriefcaseIcon, 
  CreditCardIcon, 
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { isAuthenticated } from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    requests: 0,
    responses: 0,
    credits: 0,
    completedExchanges: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/dashboard`);

        // Transform the data to match the previous format
        const transformedData = {
          user: response.data.user,
          stats: {
            requests: response.data.statistics.totalRequests,
            responses: response.data.statistics.completedRequests,
            credits: response.data.statistics.pendingRequests,
            completedExchanges: response.data.statistics.completionRate
          },
          recentActivity: [
            ...response.data.recentRequests.map(request => ({
              type: 'request',
              title: request.title,
              description: `Status: ${request.status}`,
              time: new Date(request.createdAt).toLocaleDateString()
            })),
            ...response.data.recentProvidedServices.map(service => ({
              type: 'response',
              title: service.title,
              description: `Status: ${service.status}`,
              time: new Date(service.createdAt).toLocaleDateString()
            }))
          ]
        };

        setUser(transformedData.user);
        setStats(transformedData.stats);
        setRecentActivity(transformedData.recentActivity);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <UserCircleIcon className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-gray-500">Here's what's happening with your skill exchanges today.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <BriefcaseIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.requests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Responses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.responses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Skill Credits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.credits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Exchanges</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedExchanges}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/requests/new" className="flex items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-indigo-900">Create New Request</p>
              <p className="text-xs text-indigo-600">Post a service you need</p>
            </div>
          </Link>

          <Link to="/profile" className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <UserCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Update Profile</p>
              <p className="text-xs text-green-600">Manage your skills and portfolio</p>
            </div>
          </Link>

          <Link to="/requests" className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Browse Requests</p>
              <p className="text-xs text-blue-600">Find skills to exchange</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start p-4 bg-gray-50 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  {activity.type === 'request' ? (
                    <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
                  ) : activity.type === 'response' ? (
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />
                  ) : activity.type === 'completed' ? (
                    <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity to show</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 