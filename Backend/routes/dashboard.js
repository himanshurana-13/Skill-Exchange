import express from "express";
import User from "../models/User.js";
import ServiceRequest from "../models/ServiceRequest.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get dashboard data
router.get("/", verifyToken, async (req, res) => {
  try {
    // Get user data
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's requests
    const userRequests = await ServiceRequest.find({ userId: req.user.userId });
    
    // Get responses to user's requests
    const responsesToUser = await ServiceRequest.find({
      "responses.userId": req.user.userId
    });

    // Get completed exchanges (requests with status 'completed')
    const completedExchanges = userRequests.filter(request => request.status === 'completed').length;

    // Calculate credits (simplified version - can be enhanced)
    const credits = completedExchanges * 10; // 10 credits per completed exchange

    // Create recent activity
    const recentActivity = [];
    
    // Add user's recent requests
    const recentRequests = userRequests
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    
    recentRequests.forEach(request => {
      recentActivity.push({
        type: 'request',
        title: `New request: ${request.title}`,
        description: `You created a request for ${request.skills.needed}`,
        time: new Date(request.date).toLocaleDateString()
      });
    });

    // Add recent responses
    const recentResponses = responsesToUser
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    
    recentResponses.forEach(request => {
      const userResponse = request.responses.find(r => r.userId.toString() === req.user.userId);
      if (userResponse) {
        recentActivity.push({
          type: 'response',
          title: `Response to: ${request.title}`,
          description: `You responded to a request for ${request.skills.needed}`,
          time: new Date(userResponse.date).toLocaleDateString()
        });
      }
    });

    // Sort activity by time (most recent first)
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Return dashboard data
    res.json({
      user,
      stats: {
        requests: userRequests.length,
        responses: responsesToUser.length,
        credits,
        completedExchanges
      },
      recentActivity: recentActivity.slice(0, 5) // Limit to 5 most recent activities
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user profile
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get dashboard statistics
router.get("/stats", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const stats = {
            totalExchanges: user.totalExchanges,
            activeRequests: user.pendingRequests,
            messages: user.unreadMessages,
            profileViews: user.profileViews
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get recent activities
router.get("/activities", verifyToken, async (req, res) => {
    try {
        const activities = await ServiceRequest.find({
            $or: [
                { userId: req.user.id },
                { responses: { $elemMatch: { userId: req.user.id } } }
            ]
        })
        .sort({ date: -1 })
        .limit(5)
        .populate('userId', 'name');

        const formattedActivities = activities.map(request => ({
            type: 'exchange',
            title: `New ${request.status} Request`,
            description: `${request.title} by ${request.userId.name}`,
            time: new Date(request.date).toLocaleString()
        }));

        res.json(formattedActivities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get skill progress
router.get("/skills", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const skills = user.skills.map(skill => ({
            name: skill.name,
            progress: skill.progress,
            level: skill.level
        }));

        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router; 