import SpotifyPlayer from 'react-spotify-web-playback';

const MusicPlayer = ({ play, uri, accessToken }) => {
  return (
    <SpotifyPlayer
      token={accessToken}
      uris={[uri]}
      play={play}
      autoPlay={true} 
    />
  );
};

export default MusicPlayer;
