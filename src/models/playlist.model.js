import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: "A shared vibe ✨"
    },
    coverImage: {
        type: String,
        default: "" // We can auto-set this to the first song's album art later
    },
    songs: [{
        songId: { type: String, required: true },
        title: { type: String, required: true },
        artist: { type: String, required: true },
        albumArt: { type: String },
        audioUrl: { type: String },
        duration: { type: Number }
    }],
    createdBy: {
        type: String,
        default: "Vinay & sia" // Or dynamically pass whoever created it
    }
}, { timestamps: true });

export const Playlist = mongoose.model('Playlist', playlistSchema);