import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

function MainPage() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.get('http://localhost:4000/access/token', { withCredentials: true });
        setAccessToken(response.data.accessToken);
        localStorage.setItem('accessToken', response.data.accessToken);
        console.log("Fetched access token:", response.data.accessToken);
      } catch (error) {
        console.error('Error fetching access token:', error.message);
      }
    };

    fetchAccessToken();

    const newSocket = io('http://localhost:4000', {
      transports: ['websocket'],
      withCredentials: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log("Socket Connected in main page");
      setSocketConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log("Socket Disconnected");
      setSocketConnected(false);
    });

  }, []);

  const handleCreateRoom = () => {
    if (socketConnected) {
      if (!accessToken) {
        console.error("Access token is required.");
        return;
      }

      socket.emit('createRoom', accessToken, (response) => {
        console.log('Server response:', response);
        if (response.success) {
          navigate(`/room/${response.roomId}`);
        } else {
          console.error("Error creating the room:", response.message);
        }
      });
    } else {
      console.error("Socket is not connected.");
    }
  };

  const handleJoinRoom = () => {
    navigate('/join');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="text-center p-8 bg-gray-900 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8">Welcome to the Chat App</h1>
        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            disabled={!socketConnected}
            className={`w-full py-3 px-6 font-semibold text-lg rounded-lg shadow-md focus:outline-none transition duration-300 ${
              socketConnected ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            {socketConnected ? 'Create Room' : 'Create Room (Connecting...)'}
          </button>
          <button
            onClick={handleJoinRoom}
            className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md focus:outline-none transition duration-300"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;