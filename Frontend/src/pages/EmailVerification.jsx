import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const EmailVerification = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = new URLSearchParams(location.search).get("userId");

  useEffect(() => {
    if (!userId) {
      toast.error("Invalid verification link");
      navigate("/signup");
    }
  }, [userId, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        userId,
        otp
      });
      
      toast.success(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/resend-otp", {
        userId
      });
      toast.success(response.data.message);
      setOtp(""); // Clear the OTP input
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Verify Your Email</h2>
        
        <div className="text-center mb-6">
          <div className="text-gray-600">
            <p>We've sent a verification code to your email.</p>
            <p className="mt-2">Please enter the 6-digit code below.</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center">
            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-48 text-center text-3xl tracking-[0.5em] py-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-medium text-white ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">Didn't receive the code?</p>
          <button
            onClick={handleResendOTP}
            className={`text-blue-600 hover:text-blue-800 font-medium ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            Resend Code
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/signup")}
            className="text-gray-500 hover:text-gray-700"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
