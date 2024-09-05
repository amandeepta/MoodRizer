import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import MusicPlayer from './Player/MusicPlayer';

function RoomPage() {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [song, setSong] = useState('');
  const [nowPlaying, setNowPlaying] = useState('');
  const [play, setPlay] = useState(false);
  const [songPlayBy, setSongPlayBy] = useState('');
  const [uri, setUri] = useState('');
  const accessToken = localStorage.getItem('accessToken');
  const [socketIo, setSocket] = useState(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io('http://localhost:4000', {
      transports: ['websocket'],
      withCredentials: true,
    });
    setSocket(socket);

    socket.on('connect', () => {
      socket.emit('joinRoom', accessToken, roomId, (response) => {
        if (!response.success) {
          console.error('Error joining room:', response.message);
        }
      });
    });

    socket.on('newUserJoined', (usersList, newUser) => {
      setUsers(usersList);
      setMessage(`${newUser} has joined the room.`);
      setTimeout(() => setMessage(''), 5000);
    });

    socket.on('userLeft', (leftUser, userLeft) => {
      setUsers(leftUser);
      setMessage(`${userLeft} has left the room.`);
      setTimeout(() => setMessage(''), 10000);
    });

    socket.on('receive', (songInfo) => {
      setPlay(true);
      setNowPlaying(songInfo.name);
      setSongPlayBy(songInfo.user);
      setUri(songInfo.uri);
    });

    return () => {
      socket.off('newUserJoined');
      socket.off('userLeft');
      socket.off('receive');
      socket.disconnect();
    };
  }, [accessToken, roomId]);

  const handleInputChange = (e) => {
    setSong(e.target.value);
  };

  const sendSong = () => {
    if (song && socketIo) {
      socketIo.emit('sendSong', song);
      setSong('');
    }
  };

  const handlePlay = () => {
    if (socketIo) {
      socketIo.emit('music-control', !play);
      socketIo.on('play-song', (newState) => {
        setPlay(newState);
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/path/to/your/background-image.jpg')" }}>
      <div className="w-full flex flex-col items-center justify-center bg-black bg-opacity-70 p-8">
        <div className="absolute top-8 left-8 p-4 bg-black bg-opacity-60 text-white rounded-lg shadow-lg w-80">
          <h2 className="text-xl font-semibold mb-4">Users in the room:</h2>
          <ul className="list-disc pl-4">
            {users.length > 0 ? (
              users.map((user, index) => (
                <li key={index} className="mb-2">{user}</li>
              ))
            ) : (
              <li className="text-gray-400">No users in the room</li>
            )}
          </ul>
        </div>
        <div className="flex flex-col items-center justify-center w-full max-w-4xl bg-black bg-opacity-80 p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-6">Room ID: {roomId}</h1>
          <p className="text-lg text-gray-300 mb-8">Welcome to the room. Enjoy your time here!</p>
          <div className="mb-6">
            <pre className="text-white whitespace-pre-wrap">{message}</pre>
          </div>
          <div className="flex flex-col items-center mb-6">
            <input
              type="text"
              value={song}
              onChange={handleInputChange}
              placeholder="Enter the song name"
              className="p-3 text-black rounded-lg border border-gray-300 mb-4 w-80"
            />
            <button
              onClick={sendSong}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Send Song
            </button>
            {play && (
              <h1 className="text-white mt-6 text-xl font-semibold">
                Now Playing: <span className="italic">{nowPlaying}</span> by <span className="font-semibold">{songPlayBy}</span>
              </h1>
            )}
          </div>
          <div className="mb-8">
            <button
              onClick={handlePlay}
              className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300"
            >
              {play ? "Pause" : "Play"}
            </button>
          </div>
          <div className="w-full flex flex-col items-center">
            <MusicPlayer play={play} uri={uri} accessToken={accessToken} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
