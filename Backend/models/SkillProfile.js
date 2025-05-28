import mongoose from 'mongoose';

const skillProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  avatar: {
    type: String,
    default: '/default-avatar.jpg'
  },
  primarySkill: {
    type: String,
    required: [true, 'Please add your primary skill'],
    enum: [
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
    ]
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  lookingFor: [{
    type: String,
    enum: [
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
    ]
  }],
  portfolio: [{
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  credits: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for better query performance
skillProfileSchema.index({ user: 1, createdAt: -1 });
skillProfileSchema.index({ primarySkill: 1 });
skillProfileSchema.index({ lookingFor: 1 });
skillProfileSchema.index({ location: '2dsphere' });

// Update the updatedAt timestamp before saving
skillProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('SkillProfile', skillProfileSchema); 