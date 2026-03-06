import axios from 'axios';
import ApiError from '../utils/ApiError.js';
import { SharedFavorite } from '../models/sharedFavorite.model.js';

// --- HELPER TO EXTRACT HIGH QUALITY ASSETS ---
const formatSongData = (song) => {
    const downloadUrls = song.downloadUrl || [];
    // Prioritize 320kbps for that premium feel
    const audio = downloadUrls.find(u => u.quality === '320kbps') || downloadUrls[downloadUrls.length - 1];
    
    const images = song.image || [];
    // Prioritize 500x500 for the cinematic UI
    const art = images.find(img => img.quality === '500x500') || images[images.length - 1];

    return {
        // 🔥 FIX: Saavn API 'id' is often the alphanumeric one we need
        id: song.id, 
        title: song.name || 'Unknown Title',
        // Handling both string and object formats for artists
        artist: typeof song.primaryArtists === 'string' ? song.primaryArtists : (song.artists?.primary?.[0]?.name || "Unknown Artist"),
        albumArt: art?.url || art?.link || '',
        audioUrl: audio?.url || audio?.link || '',
        duration: parseInt(song.duration) || 0
    };
};

export const toggleFavorite = async (req, res, next) => {
    try {
        const { songId, title, artist, albumArt, audioUrl, addedBy } = req.body;
        const existing = await SharedFavorite.findOne({ songId });
        
        if (existing) {
            await SharedFavorite.deleteOne({ songId });
            return res.status(200).json({ success: true, message: 'Removed from favorites', isLiked: false });
        }

        await SharedFavorite.create({ songId, title, artist, albumArt, audioUrl, addedBy });
        res.status(200).json({ success: true, message: 'Added to favorites', isLiked: true });
    } catch (error) {
        next(new ApiError(500, 'Could not update favorites: ' + error.message));
    }
};

export const getSharedFavorites = async (req, res, next) => {
    try {
        const favorites = await SharedFavorite.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: favorites });
    } catch (error) {
        next(new ApiError(500, 'Could not fetch favorites: ' + error.message));
    }
};

export const searchSongs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const query = req.query.query;

        if (!query) throw new ApiError(400, 'Search query is required.');

        const API_URL = `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
        const response = await axios.get(API_URL, { timeout: 15000 });

        const results = response.data?.data?.results || [];
        
        if (results.length === 0) {
            if (page > 1) return res.status(200).json({ success: true, data: [], hasMore: false });
            throw new ApiError(404, 'No songs found');
        }

        const songs = results.map(formatSongData);

        res.status(200).json({ 
            success: true, 
            data: songs,
            currentPage: page,
            hasMore: songs.length === limit 
        });
    } catch (error) {
        next(new ApiError(500, 'Music engine failed: ' + error.message));
    }
};

// Add this helper for diversity
const VIBE_KEYWORDS = ["Lofi", "Acoustic", "Indie Hindi", "Bollywood Chill", "Party Mix"];

export const getRecommendations = async (req, res, next) => {
    try {
        const { songId } = req.params;
        const artistHint = req.query.artist || "Lofi";
        
        console.log(`🚀 Advanced Discovery starting for: ${artistHint}`);

        // TIER 1: The Direct Suggestions (The Dream)
        try {
            const response = await axios.get(`https://saavn.sumit.co/api/songs/${songId}/suggestions`, { timeout: 4000 });
            if (response.data?.data?.length > 5) {
                const songs = response.data.data.map(formatSongData);
                return res.status(200).json({ success: true, data: songs, source: 'ai_engine' });
            }
        } catch (e) { console.log("⚠️ Tier 1 failed."); }

        // TIER 2: Recursive Discovery (The Artist + Vibe Pivot)
        try {
            // Get 5 songs from the current artist
            const artistSearch = await axios.get(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(artistHint)}&limit=10`);
            
            // Get 5 songs from a random "Vibe Keyword" to keep it fresh
            const randomVibe = VIBE_KEYWORDS[Math.floor(Math.random() * VIBE_KEYWORDS.length)];
            const vibeSearch = await axios.get(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(randomVibe)}&limit=10`);

            const combinedResults = [
                ...(artistSearch.data?.data?.results || []),
                ...(vibeSearch.data?.data?.results || [])
            ];

            // Shuffle and filter out current song
            const diverseQueue = combinedResults
                .filter(s => s.id !== songId)
                .sort(() => Math.random() - 0.5) // Randomize the mix
                .slice(0, 15)
                .map(formatSongData);

            console.log(`✨ Tier 2 Diversified: Found ${diverseQueue.length} tracks (Mixed Artist & ${randomVibe})`);
            return res.status(200).json({ success: true, data: diverseQueue, source: 'discovery_engine' });

        } catch (e) {
            console.error("🚨 Tier 2 Discovery failed.");
        }

        res.status(200).json({ success: true, data: [] });
    } catch (error) {
        next(error);
    }
};

export const getLyrics = async (req, res, next) => {
    try {
        const { songId } = req.params;
        const LYRICS_URL = `https://saavn.sumit.co/api/songs/${songId}/lyrics`;
        
        const response = await axios.get(LYRICS_URL).catch(() => null);
        
        if (!response || !response.data?.data?.lyrics) {
            return res.status(200).json({ success: true, lyrics: "Instrumental or lyrics not found... just vibe ✨" });
        }

        res.status(200).json({ success: true, lyrics: response.data.data.lyrics });
    } catch (error) {
        next(new ApiError(500, 'Lyrics engine failed.'));
    }
};