import mongoose from 'mongoose';
import SkillProfile from '../models/SkillProfile.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const cleanupDuplicates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users with profiles
    const users = await SkillProfile.distinct('user');
    console.log(`Found ${users.length} users with profiles`);

    let deletedCount = 0;

    // For each user
    for (const userId of users) {
      // Get all profiles for this user, sorted by creation date (newest first)
      const profiles = await SkillProfile.find({ user: userId })
        .sort({ createdAt: -1 });

      if (profiles.length > 1) {
        console.log(`User ${userId} has ${profiles.length} profiles. Keeping most recent one.`);
        
        // Keep the first (most recent) profile and delete the rest
        const [keepProfile, ...duplicates] = profiles;
        
        // Delete all duplicate profiles
        for (const profile of duplicates) {
          await SkillProfile.findByIdAndDelete(profile._id);
          deletedCount++;
          console.log(`Deleted duplicate profile ${profile._id}`);
        }
      }
    }

    console.log(`Cleanup completed. Deleted ${deletedCount} duplicate profiles.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupDuplicates(); 