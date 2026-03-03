import axios from 'axios';
import ApiError from '../utils/ApiError.js';

export const searchSongs = async (req, res, next) => {
  try {
    // Extract page and limit, defaulting to page 1 and 10 items
    const { query, page = 1, limit = 10 } = req.query;
    if (!query) {
      throw new ApiError(400, 'Search query is required.');
    }

    const axiosConfig = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      timeout: 15000
    };

    // Append the pagination parameters to the wrapper API
    const API_URL = `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;

    console.log(`🔍 Searching for: ${query} (Page: ${page})`);
    const response = await axios.get(API_URL, axiosConfig);

    // MORE FORGIVING CHECK: Instead of looking for a strict "success: true" boolean, 
    // we just verify that the actual array of results exists.
    if (!response.data || !response.data.data || !response.data.data.results || response.data.data.results.length === 0) {
      throw new ApiError(404, 'No songs found for that query');
    }

    // Map the data safely with multiple fallbacks
    const songs = response.data.data.results.map((song) => {

      // AUDIO: Look for .url instead of .link
      const downloadUrls = song.downloadUrl || [];
      const highQualityAudio = downloadUrls.find(u => u.quality === '320kbps') || downloadUrls[downloadUrls.length - 1];

      // IMAGE: Look for .url instead of .link
      const images = song.image || [];
      const highQualityArt = images.find(img => img.quality === '500x500') || images[images.length - 1];

      // ARTIST: Different wrappers use different keys, so we check them all
      let artistName = "Unknown Artist";
      if (typeof song.primaryArtists === 'string' && song.primaryArtists.trim() !== '') {
        artistName = song.primaryArtists;
      } else if (typeof song.artists === 'string' && song.artists.trim() !== '') {
        artistName = song.artists;
      } else if (song.singers && typeof song.singers === 'string') {
        artistName = song.singers;
      }

      return {
        id: song.id,
        title: song.name || 'Unknown Title',
        artist: artistName,
        // Using both .url and .link just to be bulletproof for the future
        albumArt: highQualityArt?.url || highQualityArt?.link || '',
        audioUrl: highQualityAudio?.url || highQualityAudio?.link || '',
        duration: parseInt(song.duration) || 0
      };
    });

    res.status(200).json({
      success: true,
      data: songs
    });

  } catch (error) {
    console.error("Music Fetch Error:", error.message);
    next(new ApiError(500, 'Music engine failed: ' + error.message));
  }
};