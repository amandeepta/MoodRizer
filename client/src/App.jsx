import React, { useState } from 'react';
import axios from 'axios';
import PromptForm from './PromptForm';
import SongList from './SongList';

const App = () => {
    const [songsData, setSongsData] = useState(null);

    const handleGenerateSongs = (data) => {
        setSongsData(data);
    };

    return (
        <div>
            <h1>Mood Music App</h1>
            <PromptForm onGenerateSongs={handleGenerateSongs} />
            {songsData && <SongList mood={songsData.mood} tracks={songsData.tracks} />}
        </div>
    );
};

export default App;
