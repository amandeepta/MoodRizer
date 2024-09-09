import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MainPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.get('https://mood-rizer-backend.onrender.com/access/token', { withCredentials: true });
        localStorage.setItem('accessToken', response.data.accessToken);
      } catch (error) {
        console.error('Error fetching access token:', error.message);
      }
    };
    fetchAccessToken();
  }, []);

  const handleCreateRoom = async () => {
    try {
      const response = await axios.get('https://mood-rizer-backend.onrender.com/access/create-room');
      console.log(response.data.roomId);
      navigate(`/room/${response.data.roomId}`);
    } catch (error) {
      console.error('Error creating room:', error.message);
    }
  };

  const handleJoinRoom = () => {
    navigate('/join');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="p-10 bg-gray-900 bg-opacity-80 rounded-lg shadow-2xl text-center space-y-8 max-w-md">
        <h1 className="text-4xl font-extrabold text-green-400 mb-6">Welcome to MoodRizer</h1>
        <p className="text-gray-300 text-lg">
          Create or join a room to enjoy music together.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-full shadow-lg transition duration-300 transform hover:scale-105"
          >
            Create Room
          </button>
          <button
            onClick={handleJoinRoom}
            className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-full shadow-lg transition duration-300 transform hover:scale-105"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
