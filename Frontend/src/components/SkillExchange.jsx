import React, { useState, useEffect } from 'react';
import { getExchanges, createExchange, updateExchangeStatus } from '../services/exchangeService';
import { toast } from 'react-toastify';

const SkillExchange = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    recipientId: '',
    senderSkill: '',
    recipientSkill: ''
  });

  useEffect(() => {
    fetchExchanges();
    // Get user name from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  const fetchExchanges = async () => {
    try {
      const data = await getExchanges();
      setExchanges(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error('Failed to fetch exchanges');
    }
  };

  const handleCreateExchange = async (e) => {
    e.preventDefault();
    try {
      const newExchange = await createExchange(formData);
      setExchanges([newExchange, ...exchanges]);
      setFormData({
        recipientId: '',
        senderSkill: '',
        recipientSkill: ''
      });
      toast.success('Exchange proposal created successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to create exchange proposal');
    }
  };

  const handleStatusUpdate = async (exchangeId, newStatus) => {
    try {
      const updatedExchange = await updateExchangeStatus(exchangeId, newStatus);
      setExchanges(exchanges.map(exchange => 
        exchange._id === exchangeId ? updatedExchange : exchange
      ));
      toast.success('Exchange status updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update exchange status');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, {userName || 'User'}!</h2>
            <p className="text-gray-600">Here's what's happening with your skill exchanges today.</p>
          </div>
        </div>
      </div>
      
      {/* Create Exchange Form */}
      <form onSubmit={handleCreateExchange} className="mb-8 p-6 bg-white rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Create New Exchange</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Recipient ID</label>
            <input
              type="text"
              name="recipientId"
              value={formData.recipientId}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Skill</label>
            <input
              type="text"
              name="senderSkill"
              value={formData.senderSkill}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Requested Skill</label>
            <input
              type="text"
              name="recipientSkill"
              value={formData.recipientSkill}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Exchange Proposal
          </button>
        </div>
      </form>
      
      {/* Exchange List */}
      <div className="space-y-4">
        {exchanges.map(exchange => (
          <div key={exchange._id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {exchange.sender.name} wants to exchange {exchange.senderSkill} for {exchange.recipientSkill}
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className={`font-medium ${
                    exchange.status === 'accepted' ? 'text-green-600' :
                    exchange.status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>{exchange.status}</span>
                </p>
              </div>
              
              {exchange.status === 'pending' && exchange.recipient._id === localStorage.getItem('userId') && (
                <div className="space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(exchange._id, 'accepted')}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(exchange._id, 'rejected')}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillExchange; 