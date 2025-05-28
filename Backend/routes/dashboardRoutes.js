import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import ServiceRequest from '../models/ServiceRequest.js';
import SkillProfile from '../models/SkillProfile.js';
import User from '../models/User.js';

const router = express.Router();

// Get dashboard data
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user information
    const user = await User.findById(userId).select('name email');

    // Get user's skill profiles
    const skillProfiles = await SkillProfile.find({ user: userId })
      .select('skills experienceLevel');

    // Get user's service requests
    const serviceRequests = await ServiceRequest.find({ user: userId })
      .select('title status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get requests where user is the provider
    const providerRequests = await ServiceRequest.find({ provider: userId })
      .select('title status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate statistics
    const totalRequests = await ServiceRequest.countDocuments({ user: userId });
    const completedRequests = await ServiceRequest.countDocuments({ 
      user: userId,
      status: 'completed'
    });
    const pendingRequests = await ServiceRequest.countDocuments({ 
      user: userId,
      status: 'pending'
    });

    // Get skill distribution
    const skillDistribution = skillProfiles.reduce((acc, profile) => {
      profile.skills.forEach(skill => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {});

    res.json({
      user,
      skillProfiles,
      recentRequests: serviceRequests,
      recentProvidedServices: providerRequests,
      statistics: {
        totalRequests,
        completedRequests,
        pendingRequests,
        completionRate: totalRequests ? (completedRequests / totalRequests) * 100 : 0
      },
      skillDistribution
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

export default router; 