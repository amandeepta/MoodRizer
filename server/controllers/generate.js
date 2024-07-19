const express = require('express');
const { spawn } = require('child_process');
const dotenv = require('dotenv');
const app = express();
const port = 3000;

// Load environment variables from .env
dotenv.config();

app.get('/', (req, res) => {
    res.send('Welcome to Spotify Recommender Backend');
});

app.get('/recommend', (req, res) => {
    const { mood, songs } = req.query;

    const pythonProcess = spawn('python', ['./spotify_recommendations.py', mood, songs]);
    
    pythonProcess.stdout.on('data', (data) => {
        const recommendations = data.toString().split('\n').filter(url => url.trim() !== '');
        res.json({ recommendations });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error from Python script: ${data}`);
        res.status(500).json({ error: 'Internal server error' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
