import { useState } from "react";
import PropTypes from "prop-types";
import { Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NewRequestForm = ({ onCreate, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    skills: {
      needed: "Web Development",
      offered: "Web Development"
    },
    description: "",
    deadline: ""
  });

  const skillOptions = [
    "Web Development",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "UI/UX Design"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "skillNeeded" || name === "skillOffered") {
      setFormData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [name === "skillNeeded" ? "needed" : "offered"]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      console.log('Submitting request with data:', {
        title: formData.title,
        description: formData.description,
        skills: {
          needed: formData.skills.needed,
          offered: formData.skills.offered
        }
      });

      const response = await axios.post(`${API_URL}/service-requests`, {
        title: formData.title,
        description: formData.description,
        skills: {
          needed: formData.skills.needed,
          offered: formData.skills.offered
        }
      }, {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      toast.success("Request created successfully!");
      onCreate(response.data);
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error(error.response?.data?.message || "Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Create New Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            placeholder="What service do you need?"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Skill Needed</label>
            <select
              name="skillNeeded"
              value={formData.skills.needed}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 appearance-none bg-white"
            >
              {skillOptions.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Skill Offered</label>
            <select
              name="skillOffered"
              value={formData.skills.offered}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 appearance-none bg-white"
            >
              {skillOptions.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            placeholder="Describe your request in detail..."
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 min-h-[120px]"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Deadline</label>
          <div className="relative">
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 pr-10"
              required
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Request
          </button>
        </div>
      </form>
    </div>
  );
};

NewRequestForm.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default NewRequestForm;
