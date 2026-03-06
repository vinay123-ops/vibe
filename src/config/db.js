import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: "D:/startup/music/backend/.env"});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));