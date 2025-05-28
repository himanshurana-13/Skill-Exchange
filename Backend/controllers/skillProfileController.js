import SkillProfile from '../models/SkillProfile.js';

// Get all skill profiles
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await SkillProfile.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Error fetching profiles' });
  }
};

// Get user's profiles
const getUserProfile = async (req, res) => {
  try {
    const profiles = await SkillProfile.find({ user: req.user._id })
      .populate('user', 'name email');
    
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    res.status(500).json({ message: 'Error fetching user profiles' });
  }
};

// Create profile
const createProfile = async (req, res) => {
  try {
    const { name, primarySkill, description, lookingFor } = req.body;

    // Validate required fields
    if (!name || !primarySkill || !description) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        missingFields: {
          name: !name,
          primarySkill: !primarySkill,
          description: !description
        }
      });
    }

    // Validate primarySkill against enum values
    const validSkills = ['Web Development', 'Graphic Design', 'Content Writing', 'Digital Marketing', 'UI/UX Design'];
    if (!validSkills.includes(primarySkill)) {
      return res.status(400).json({ 
        message: 'Invalid primary skill',
        validSkills
      });
    }

    // Validate description length
    if (description.length > 500) {
      return res.status(400).json({ 
        message: 'Description cannot be more than 500 characters',
        currentLength: description.length
      });
    }

    // Validate lookingFor skills
    if (lookingFor && Array.isArray(lookingFor)) {
      const invalidSkills = lookingFor.filter(skill => !validSkills.includes(skill));
      if (invalidSkills.length > 0) {
        return res.status(400).json({ 
          message: 'Invalid skills in lookingFor',
          invalidSkills,
          validSkills
        });
      }
    }

    // Create profile
    const profile = new SkillProfile({
      user: req.user._id,
      name: name.trim(),
      primarySkill,
      description: description.trim(),
      lookingFor: Array.isArray(lookingFor) ? lookingFor : []
    });

    const newProfile = await profile.save();
    await newProfile.populate('user', 'name email');
    
    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      message: 'Error creating profile',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, primarySkill, description, lookingFor } = req.body;

    // Validate required fields
    if (!name || !primarySkill || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find and update profile
    const profile = await SkillProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const updates = {
      name,
      primarySkill,
      description,
      lookingFor: Array.isArray(lookingFor) ? lookingFor : profile.lookingFor
    };

    const updatedProfile = await SkillProfile.findByIdAndUpdate(
      profile._id,
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Delete profile
const deleteProfile = async (req, res) => {
  try {
    const profile = await SkillProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    await profile.deleteOne();
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Error deleting profile' });
  }
};

export {
  getAllProfiles,
  getUserProfile,
  createProfile,
  updateProfile,
  deleteProfile
}; 