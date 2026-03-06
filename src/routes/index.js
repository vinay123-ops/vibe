import express from 'express';
import userRoute from './user.route.js';
import music from "./music.route.js"
import playlists from './playlist.routes.js';

const router = express.Router();

router.use('/users', userRoute);
router.use('/music', music )
router.use('/playlists', playlists);

export default router;