# MoodRizer

## Overview

MoodRizer is a collaborative music player that allows users to create or join rooms and enjoy music together. Built with React, Tailwind CSS, and integrated with the Spotify API, this app enables synchronized song playback, room management, and a seamless music experience for everyone in the room.

## Features

- **Create Rooms**: Start a new room and invite others to join the collaborative music session.
- **Join Rooms**: Enter an existing room and participate in the shared music experience.
- **Search Spotify Songs**: Search and add songs from Spotify to the queue.
- **Control Playback**: Play, pause, and control the music, synced for everyone in the room.
- **Spotify Integration**: Connect your Spotify account to enable playback and searching within the app.
- **Real-Time Updates**: Enjoy real-time communication using Socket.IO for smooth room and music management.

## Technologies

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Real-Time Communication**: Socket.IO
- **Music Service**: Spotify API
- **Authentication**: JWT, Spotify OAuth
- **Hosting**:
  - Frontend: Vercel
  - Backend: Render

## Installation

### Prerequisites

- Node.js
- Yarn package manager
- A Spotify Developer account (for API credentials)

### Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/moodrizer.git
    cd moodrizer
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    - Create a `.env` file in the root directory and add the following:
    ```bash
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
    BACKEND_URL=https://mood-rizer-backend.onrender.com
    FRONTEND_URL=https://mood-rizer.vercel.app
    ```

4. Start the development server:
    ```bash
    npm run dev
    ```

## Usage

1. Open your browser and navigate to `http://localhost:5713`.
2. Log in using your Spotify account.
3. Create or join a room and start playing music!

## Production Build

To create a production build, run:
```bash
npm build
