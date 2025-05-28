import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PopularSkills from "./components/PopularSkills";
import RecentRequests from "./components/RecentRequests";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Dashboard from "./components/Dashboard";
import ServiceRequest from "./components/ServiceRequest";
import SkillExchange from "./pages/SkillExchange";
import EmailVerification from "./pages/EmailVerification";
import SkillProfileForm from "./components/SkillProfileForm";

const App = () => {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      try {
        setUser(JSON.parse(loggedInUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
      {user && <Navbar user={user} setUser={setUser} />}
      
      <Routes>
       
        <Route path="/" element={user ? <MainPage /> : <Navigate to="/signup" />} />
        
    
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/verify-email" element={user ? <Navigate to="/" /> : <EmailVerification />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
        
      
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/requests" element={user ? <ServiceRequest /> : <Navigate to="/login" />} />
        <Route path="/skillExchange" element={user ? <SkillExchange /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <SkillProfileForm /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};


const MainPage = () => {
  return (
    <>
      <Hero />
      <PopularSkills />
      <RecentRequests />
    </>
  );
};

export default App;

