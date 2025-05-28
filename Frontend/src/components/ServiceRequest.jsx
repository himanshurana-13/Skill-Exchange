import { useEffect, useState } from "react";
import { User, Plus, MessageCircle, Calendar } from "lucide-react";
import NewRequestForm from "./NewRequestForm";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ServiceRequestsApp = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);

  const toggleForm = () => setShowForm(!showForm);

  const addNewRequest = (newRequest) => {
    setRequests([...requests, newRequest]);
    setShowForm(false);
    toast.success("Request created successfully!");
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/login');
          return;
        }

       const response = await axios.get(`${API_URL}/api/service-requests`);

        setRequests(response.data);
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.response?.data?.message || "Failed to load requests");
      }
    };
    fetchRequests();
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
        <button 
          onClick={toggleForm}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          New Request
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <NewRequestForm onCreate={addNewRequest} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {requests.map((request) => (
          <div key={request._id} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
                    <p className="text-gray-500 mt-1">{request.name}</p>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(request.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      <span>{request.responses?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mt-4">{request.description}</p>

                <div className="mt-6 flex flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-red-500 mb-2">Needs:</p>
                    <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-sm">
                      {request.skills?.needed || 'No skills needed'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-green-500 mb-2">Offers:</p>
                    <span className="inline-block px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm">
                      {request.skills?.offered || 'No skills offered'}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button 
                    className="text-indigo-600 hover:text-indigo-700 font-medium border-2 border-indigo-600 px-6 py-2 rounded-xl transition-colors hover:bg-indigo-50"
                    onClick={() => toast.success("Response sent successfully!")}
                  >
                    Respond to Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">No requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestsApp;
