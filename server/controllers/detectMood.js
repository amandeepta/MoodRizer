const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { spawn } = require('child_process');
const querystring = require('querystring');
const path = require('path');
const app = express();
const port = 3000;


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

let spotifyAccessToken = '';
const detectMood = (text) => {
    return new Promise((resolve, reject) => {
        const process = spawn('python3', ['mood_detection.py', text]);

        process.stdout.on('data', (data) => {
            resolve(data.toString().trim());
        });

        process.stderr.on('data', (data) => {
            reject(data.toString());
        });
    });
};

exports.detect = async (req, res) => {
    const { text } = req.body;

    try {
        const mood = await detectMood(text);
        res.json({ mood });
    } catch (error) {
        res.status(500).send(`Error detecting mood: ${error}`);
    }
};

