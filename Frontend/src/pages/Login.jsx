import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import PropTypes from "prop-types"; // Import PropTypes
import { ArrowRight } from "lucide-react";

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting data:", formData);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Login response:", res.data);
      
      // Store both user and token in localStorage
      const userData = {
        ...res.data.user,
        name: res.data.user.name || res.data.user.fullName || res.data.user.email.split('@')[0]
      };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", res.data.token);
      
      // Set default authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(userData);
      toast.success("Login Successful!");

      setTimeout(() => {
        console.log("Navigating to /");
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Login Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <h2 className="text-3xl font-bold text-center mb-4">Welcome back!</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg mb-2"
            required
          />
          <Link to="/forgot-password" className="text-blue-600 text-sm block text-right mb-4">
            Forgot your password?
          </Link>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg text-lg font-medium">
            Sign In <ArrowRight size={20} />
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Dont have an account? <Link to="/signup" className="text-blue-600 font-medium">Sign up</Link>
        </p>
        <div className="text-center my-4 text-gray-500">Or continue with</div>
        <div className="flex gap-4">
          <button className="w-1/2 bg-gray-200 py-2 rounded-lg">Google</button>
          <button className="w-1/2 bg-gray-200 py-2 rounded-lg">GitHub</button>
        </div>
      </div>
    </div>
  );
};

// Adding prop types validation
Login.propTypes = {
  setUser: PropTypes.func.isRequired, // Define setUser prop type as a function
};

export default Login;
