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

    const socket = io('https://mood-rizer-backend.onrender.com', {
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
    <div className="flex min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-purple-500">
      <div className="w-full flex flex-col items-center justify-center bg-black bg-opacity-70 p-8">
        <div className="absolute top-3 left-2 p-4 bg-gray-800 bg-opacity-90 text-white rounded-lg shadow-lg w-60">
          <h2 className="text-xl font-semibold mb-4">Users in the Room:</h2>
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
        <div className="flex flex-col items-center justify-center w-full max-w-4xl bg-gray-900 bg-opacity-90 p-10 rounded-lg shadow-2xl">
          <h1 className="text-4xl font-extrabold text-green-400 mb-6">Room ID: {roomId}</h1>
          <p className="text-lg text-gray-300 mb-6">Enjoy the shared music experience in the room!</p>
          <div className="mb-4">
            <pre className="text-white">{message}</pre>
          </div>
          <div className="flex flex-col items-center mb-8">
            <input
              type="text"
              value={song}
              onChange={handleInputChange}
              placeholder="Enter the song name"
              className="w-80 p-3 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-300 mb-4"
            />
            <button
              onClick={sendSong}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full shadow-lg transition duration-300 transform hover:scale-105"
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
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-lg transition duration-300 transform hover:scale-105"
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
