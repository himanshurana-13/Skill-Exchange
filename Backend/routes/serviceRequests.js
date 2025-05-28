import express from "express";
import ServiceRequest from "../models/ServiceRequest.js";
import { verifyToken } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Fetch all requests
router.get("/", verifyToken, async (req, res) => {
    try {
        const requests = await ServiceRequest.find()
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error("Error fetching requests:", err);
        res.status(500).json({ message: "Failed to fetch requests" });
    }
});

// Create a new request
router.post("/", verifyToken, async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        console.log("User from token:", req.user);

        const { title, description, skills } = req.body;

        if (!title || !description || !skills?.needed || !skills?.offered) {
            console.log("Validation failed:", { title, description, skills });
            return res.status(400).json({ 
                message: "All fields are required",
                missing: {
                    title: !title,
                    description: !description,
                    skillsNeeded: !skills?.needed,
                    skillsOffered: !skills?.offered
                }
            });
        }

        // Get user details from the database
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newRequest = new ServiceRequest({
            title,
            description,
            userId: req.user.userId,
            name: user.name,
            skills: {
                needed: skills.needed,
                offered: skills.offered
            },
            date: new Date()
        });

        console.log("Attempting to save request:", newRequest);

        const savedRequest = await newRequest.save();
        console.log("Request saved successfully:", savedRequest);
        
        // Populate the user data before sending response
        await savedRequest.populate('userId', 'name');
        
        res.status(201).json(savedRequest);
    } catch (err) {
        console.error("Error creating request:", err);
        console.error("Error details:", {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({ 
            message: "Failed to create request",
            error: err.message 
        });
    }
});

// Get a single request
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id)
            .populate('userId', 'name')
            .populate('responses.userId', 'name');
            
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Increment views
        request.views += 1;
        await request.save();

        res.json(request);
    } catch (err) {
        console.error("Error fetching request:", err);
        res.status(500).json({ message: "Failed to fetch request" });
    }
});

// Add a response to a request
router.post("/:id/responses", verifyToken, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const request = await ServiceRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.responses.push({
            userId: req.user.id,
            message
        });

        const updatedRequest = await request.save();
        await updatedRequest.populate('responses.userId', 'name');

        res.json(updatedRequest);
    } catch (err) {
        console.error("Error adding response:", err);
        res.status(500).json({ message: "Failed to add response" });
    }
});

// Update request status
router.patch("/:id/status", verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['open', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const request = await ServiceRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Check if user is the owner of the request
        if (request.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this request" });
        }

        request.status = status;
        const updatedRequest = await request.save();
        await updatedRequest.populate('userId', 'name');

        res.json(updatedRequest);
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ message: "Failed to update status" });
    }
});

export default router;
