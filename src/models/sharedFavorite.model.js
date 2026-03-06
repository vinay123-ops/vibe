// models/sharedFavorite.model.js
import mongoose from 'mongoose';

const sharedFavoriteSchema = new mongoose.Schema({
  songId: { type: String, required: true, unique: true }, // Saavn ID
  title: { type: String, required: true },
  artist: { type: String, required: true },
  albumArt: { type: String },
  audioUrl: { type: String, required: true },
  addedBy: { type: String, enum: ['Vinay', 'Sia'], required: true },
}, { timestamps: true });

export const SharedFavorite = mongoose.model('SharedFavorite', sharedFavoriteSchema);