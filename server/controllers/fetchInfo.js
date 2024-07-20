const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');
const User = require('../models/User');

const spotifyApi = new SpotifyWebApi();

exports.fetchInfo = async (req, res) => {
  const accessToken = req.query.accessToken;

  if (!accessToken) {
    return res.status(400).json({ error: 'No access token provided' });
  }

  try {
    spotifyApi.setAccessToken(accessToken);

    const userInfo = await spotifyApi.getMe();
    const topTracks = await spotifyApi.getMyTopTracks({ time_range: 'long_term', limit: 50 });
    const topGenres = {};
    const artistFrequency = {};

    for (const track of topTracks.body.items) {
      for (const artist of track.artists) {
        const artistInfo = await spotifyApi.getArtist(artist.id);

        artistFrequency[artist.name] = (artistFrequency[artist.name] || 0) + 1;
        
        artistInfo.body.genres.forEach(genre => {
          topGenres[genre] = (topGenres[genre] || 0) + 1;
        });
      }
    }

    const sortedGenres = Object.entries(topGenres).sort((a, b) => b[1] - a[1]);
    const sortedArtists = Object.entries(artistFrequency).sort((a, b) => b[1] - a[1]);
    const favoriteGenre = sortedGenres[0] ? sortedGenres[0][0] : 'Unknown';
    const leastFavoriteGenre = sortedGenres[sortedGenres.length - 1] ? sortedGenres[sortedGenres.length - 1][0] : 'Unknown';
    const favoriteArtist = sortedArtists[0] ? sortedArtists[0][0] : 'Unknown';

    res.status(200).json({
        displayName: userInfo.body.display_name,
        profileImage: userInfo.body.images.length > 0 ? userInfo.body.images[0].url : null,
      favoriteGenre,
      leastFavoriteGenre,
      favoriteArtist
    });
  } catch (error) {
    console.error('Error fetching user info from Spotify:', error);
    res.status(500).json({ error: 'Failed to fetch user info from Spotify' });
  }
};
