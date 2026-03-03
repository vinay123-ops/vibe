import express from 'express';
import userRoute from './user.route.js';
import music from "./music.route.js"
const router = express.Router();
router.use('/users', userRoute);
router.use('/music', music )
export default router;