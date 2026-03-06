import express from 'express';
import { getSharedFavorites, searchSongs, toggleFavorite, getRecommendations } from '../controllers/music.controller.js';
const router = express.Router();

// GET /v1/music/search?query=YOUR_SONG
router.get('/search', searchSongs);
router.post('/favorites', toggleFavorite)
router.get('/favorites', getSharedFavorites)
router.get('/:songId/suggestions', getRecommendations);
export default router;