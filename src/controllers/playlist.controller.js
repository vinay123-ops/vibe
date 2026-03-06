import { Playlist } from '../models/playlist.model.js';
import ApiError from '../utils/ApiError.js';

// --- CREATE: Make a new empty playlist ---
export const createPlaylist = async (req, res, next) => {
    try {
        const { name, description, createdBy } = req.body;
        if (!name) throw new ApiError(400, 'Playlist name is required');

        const playlist = await Playlist.create({ name, description, createdBy });
        res.status(201).json({ success: true, data: playlist });
    } catch (error) {
        next(new ApiError(500, 'Could not create playlist: ' + error.message));
    }
};

// --- READ: Get all shared playlists ---
export const getAllPlaylists = async (req, res, next) => {
    try {
        const playlists = await Playlist.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: playlists });
    } catch (error) {
        next(new ApiError(500, 'Could not fetch playlists'));
    }
};

// --- READ: Get a single playlist and its songs ---
export const getPlaylistById = async (req, res, next) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) throw new ApiError(404, 'Playlist not found');
        
        res.status(200).json({ success: true, data: playlist });
    } catch (error) {
        next(new ApiError(500, 'Could not fetch the playlist'));
    }
};

// --- UPDATE: Add a song to the playlist ---
export const addSongToPlaylist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const songData = req.body; // Expects { songId, title, artist, albumArt, audioUrl }

        if (!songData.songId) throw new ApiError(400, 'Song data is missing');

        // Use $push to add the song, and optionally update the cover image if it's empty
        const playlist = await Playlist.findById(id);
        if (!playlist) throw new ApiError(404, 'Playlist not found');

        // Prevent duplicates in the same playlist
        const exists = playlist.songs.some(s => s.songId === songData.songId);
        if (exists) return res.status(200).json({ success: true, message: 'Song already in playlist', data: playlist });

        playlist.songs.push(songData);
        
        // Auto-set cover image to the first song added if it doesn't have one
        if (!playlist.coverImage && songData.albumArt) {
            playlist.coverImage = songData.albumArt;
        }

        await playlist.save();
        res.status(200).json({ success: true, message: 'Added to playlist', data: playlist });
    } catch (error) {
        next(new ApiError(500, 'Could not add song: ' + error.message));
    }
};

// --- DELETE: Remove a song from the playlist ---
export const removeSongFromPlaylist = async (req, res, next) => {
    try {
        const { id, songId } = req.params;

        const playlist = await Playlist.findByIdAndUpdate(
            id,
            { $pull: { songs: { songId: songId } } }, // Pulls the object matching the songId out of the array
            { new: true }
        );

        if (!playlist) throw new ApiError(404, 'Playlist not found');
        res.status(200).json({ success: true, message: 'Removed from playlist', data: playlist });
    } catch (error) {
        next(new ApiError(500, 'Could not remove song: ' + error.message));
    }
};

// --- DELETE: Delete the entire playlist ---
export const deletePlaylist = async (req, res, next) => {
    try {
        const playlist = await Playlist.findByIdAndDelete(req.params.id);
        if (!playlist) throw new ApiError(404, 'Playlist not found');
        
        res.status(200).json({ success: true, message: 'Playlist deleted entirely' });
    } catch (error) {
        next(new ApiError(500, 'Could not delete playlist: ' + error.message));
    }
};