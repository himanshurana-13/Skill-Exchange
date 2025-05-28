import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.db.collection('skillprofiles');
    
    // Drop the unique index on user field
    await collection.dropIndex('user_1');
    console.log('Successfully dropped unique index on user field');

    // Create a new non-unique index
    await collection.createIndex({ user: 1 }, { unique: false });
    console.log('Successfully created non-unique index on user field');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropIndex(); 