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
      })
    }
  };

  return (
    <div className="flex min-h-screen bg-[url('/path/to/your/background-image.jpg')] bg-cover bg-center text-center">
      <div className="w-full flex flex-col items-center justify-center bg-black bg-opacity-60 p-8">
        <div className="absolute top-0 left-0 p-8 bg-black bg-opacity-50 text-white rounded-br-lg">
          <h2 className="text-2xl font-bold mb-4">Users in the room:</h2>
          <ul className="list-disc">
            {users.length > 0 ? (
              users.map((user, index) => (
                <li key={index} className="mb-2">
                  {user}
                </li>
              ))
            ) : (
              <li className="text-gray-400">No users in the room</li>
            )}
          </ul>
        </div>
        <div className="flex flex-col items-center justify-center w-full max-w-lg bg-black bg-opacity-70 p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-extrabold text-white mb-6">Room ID: {roomId}</h1>
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
              <h1 className="text-white mt-6 text-2xl font-bold">
                Now Playing: <span className="italic">{nowPlaying}</span> by <span className="font-semibold">{songPlayBy}</span>
              </h1>
            )}
          </div>
          <div>
            <button onClick={handlePlay} className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300">
              {play ? "Pause" : "Play"}
            </button>
          </div>
          <MusicPlayer play={play} uri={uri} accessToken={accessToken} />
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
