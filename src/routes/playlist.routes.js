import express from 'express';
import { 
    createPlaylist, 
    getAllPlaylists, 
    getPlaylistById, 
    addSongToPlaylist, 
    removeSongFromPlaylist, 
    deletePlaylist 
} from '../controllers/playlist.controller.js';

const router = express.Router();

// Base route: /v1/playlists

router.post('/', createPlaylist);               // C: Create a new playlist
router.get('/', getAllPlaylists);               // R: Get all playlists
router.get('/:id', getPlaylistById);            // R: Get specific playlist

router.post('/:id/songs', addSongToPlaylist);   // U: Add song
router.delete('/:id/songs/:songId', removeSongFromPlaylist); // D: Remove song

router.delete('/:id', deletePlaylist);          // D: Delete whole playlist

export default router;