import express from 'express';
import { searchSongs } from '../controllers/music.controller.js';

const router = express.Router();

// GET /v1/music/search?query=YOUR_SONG
router.get('/search', searchSongs);

export default router;