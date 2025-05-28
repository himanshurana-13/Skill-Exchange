import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAllProfiles,
  getUserProfile,
  createProfile,
  updateProfile,
  deleteProfile
} from '../controllers/skillProfileController.js';
import { verifyToken } from "../middleware/auth.js";
import SkillProfile from "../models/SkillProfile.js";
import User from "../models/User.js";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image, PDF, and document files are allowed!"));
  }
});

// Get all profiles and create new profile
router.route('/')
  .get(getAllProfiles)
  .post(protect, createProfile);

// Get, update and delete user's own profile
router.route('/me')
  .get(protect, getUserProfile)
  .put(protect, updateProfile)
  .delete(protect, deleteProfile);

// Get user's skill profile
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await SkillProfile.findOne({ user: req.user.userId });
    
    res.json({
      user,
      profile
    });
  } catch (error) {
    console.error("Error fetching skill profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create or update skill profile
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log("Received profile update request:", req.body);
    console.log("User ID:", req.user.userId);
    
    const { name, primarySkill, description, lookingFor, portfolio } = req.body;

    // Validate required fields
    if (!name || !primarySkill || !description) {
      console.log("Missing required fields:", { name, primarySkill, description });
      return res.status(400).json({ 
        message: "Please provide all required fields",
        missingFields: {
          name: !name,
          primarySkill: !primarySkill,
          description: !description
        }
      });
    }

    // Validate primarySkill against enum values
    const validSkills = [
      'Web Development', 
      'Graphic Design', 
      'Content Writing', 
      'Digital Marketing', 
      'UI/UX Design',
      'Mobile Development',
      'Data Analysis',
      'Video Editing',
      'Social Media Management',
      'SEO Optimization'
    ];
    
    if (!validSkills.includes(primarySkill)) {
      console.log("Invalid primary skill:", primarySkill);
      return res.status(400).json({ 
        message: "Invalid primary skill",
        validSkills
      });
    }

    // Validate lookingFor values if provided
    if (lookingFor && Array.isArray(lookingFor)) {
      const invalidSkills = lookingFor.filter(skill => !validSkills.includes(skill));
      if (invalidSkills.length > 0) {
        console.log("Invalid skills in lookingFor:", invalidSkills);
        return res.status(400).json({ 
          message: "Invalid skills in lookingFor",
          invalidSkills,
          validSkills
        });
      }
    }

    // Check if profile exists
    let profile = await SkillProfile.findOne({ user: req.user.userId });
    console.log("Existing profile:", profile ? "Found" : "Not found");

    if (profile) {
      // Update existing profile
      console.log("Updating existing profile");
      profile.name = name;
      profile.primarySkill = primarySkill;
      profile.description = description;
      profile.lookingFor = lookingFor || [];
      profile.portfolio = portfolio || [];
      await profile.save();
    } else {
      // Create new profile
      console.log("Creating new profile");
      profile = new SkillProfile({
        user: req.user.userId,
        name,
        primarySkill,
        description,
        lookingFor: lookingFor || [],
        portfolio: portfolio || []
      });
      await profile.save();
    }

    console.log("Profile updated successfully");
    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Error updating skill profile:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error("Mongoose validation error:", error.errors);
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Upload portfolio sample to Cloudinary
router.post("/portfolio", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Ensure the uploads directory exists
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "skill-exchange/portfolio",
      resource_type: "auto"
    });

    // Delete the local file after uploading to Cloudinary
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Get the file type based on the file extension
    const fileType = path.extname(req.file.originalname).toLowerCase();
    let type = "image";
    if (fileType === '.pdf') {
      type = "pdf";
    } else if (fileType === '.doc' || fileType === '.docx') {
      type = "document";
    }

    // Create portfolio item
    const portfolioItem = {
      url: result.secure_url,
      title: req.body.title || req.file.originalname,
      type: type,
      uploadedAt: new Date()
    };

    // Add the portfolio item to the user's profile
    const profile = await SkillProfile.findOne({ user: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.portfolio.push(portfolioItem);
    await profile.save();

    res.status(200).json({
      message: "Portfolio sample uploaded successfully",
      portfolioItem
    });
  } catch (error) {
    console.error("Error uploading portfolio sample:", error);
    // Clean up the uploaded file if there's an error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      message: error.message || "Failed to upload portfolio sample"
    });
  }
});

// Delete portfolio sample
router.delete("/portfolio/:id", verifyToken, async (req, res) => {
  try {
    const profile = await SkillProfile.findOne({ user: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Find the portfolio item
    const portfolioItem = profile.portfolio.id(req.params.id);
    if (!portfolioItem) {
      return res.status(404).json({ message: "Portfolio item not found" });
    }

    // Extract public_id from Cloudinary URL
    const urlParts = portfolioItem.url.split('/');
    const publicId = urlParts.slice(-1)[0].split('.')[0];
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(`skill-exchange/portfolio/${publicId}`);

    // Remove from profile
    profile.portfolio.pull(req.params.id);
    await profile.save();

    res.status(200).json({ message: "Portfolio sample deleted successfully" });
  } catch (error) {
    console.error("Error deleting portfolio sample:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router; 