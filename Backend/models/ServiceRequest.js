import mongoose from "mongoose";

const ServiceRequestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    skills: { 
        needed: { type: String, required: true },
        offered: { type: String, required: true }
    },
    status: { 
        type: String, 
        enum: ['open', 'in-progress', 'completed'],
        default: 'open'
    },
    responses: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        date: { type: Date, default: Date.now }
    }],
    views: { type: Number, default: 0 }
}, { timestamps: true });

const ServiceRequest = mongoose.model("ServiceRequest", ServiceRequestSchema);

export default ServiceRequest;
