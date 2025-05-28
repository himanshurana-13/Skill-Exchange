const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SkillProfile = require('../models/SkillProfile');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/portfolio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get user's skill profile
router.get('/', auth, async (req, res) => {
  try {
    let profile = await SkillProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update skill profile
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      primarySkill,
      description,
      lookingFor
    } = req.body;

    // Validate required fields
    if (!name || !primarySkill || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let profile = await SkillProfile.findOne({ user: req.user.id });

    if (profile) {
      // Update existing profile
      profile = await SkillProfile.findOneAndUpdate(
        { user: req.user.id },
        {
          $set: {
            name,
            primarySkill,
            description,
            lookingFor
          }
        },
        { new: true }
      );
    } else {
      // Create new profile
      profile = new SkillProfile({
        user: req.user.id,
        name,
        primarySkill,
        description,
        lookingFor
      });
      await profile.save();
    }

    res.json(profile);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload portfolio item
router.post('/portfolio', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profile = await SkillProfile.findOne({ user: req.user.id });
    if (!profile) {
      // Delete uploaded file if profile doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Profile not found' });
    }

    const portfolioItem = {
      url: `/uploads/portfolio/${req.file.filename}`,
      title: req.file.originalname,
      type: req.file.mimetype,
      uploadedAt: Date.now()
    };

    profile.portfolio.push(portfolioItem);
    await profile.save();

    res.json(portfolioItem);
  } catch (err) {
    console.error('Error uploading portfolio item:', err);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete portfolio item
router.delete('/portfolio/:index', auth, async (req, res) => {
  try {
    const profile = await SkillProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= profile.portfolio.length) {
      return res.status(400).json({ message: 'Invalid portfolio item index' });
    }

    // Delete the file from the filesystem
    const portfolioItem = profile.portfolio[index];
    const filePath = path.join(__dirname, '..', portfolioItem.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove the item from the portfolio array
    profile.portfolio.splice(index, 1);
    await profile.save();

    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (err) {
    console.error('Error deleting portfolio item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 