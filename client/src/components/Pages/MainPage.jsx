import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MainPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.get('http://localhost:4000/access/token', { withCredentials: true });
        localStorage.setItem('accessToken', response.data.accessToken);
      } catch (error) {
        console.error('Error fetching access token:', error.message);
      }
    };
    fetchAccessToken();
  });

  const handleCreateRoom = async () => {
    try {
      const response = await axios.get('http://localhost:4000/access/create-room');
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
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="text-center p-8 bg-gray-900 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8">Welcome to the Chat App</h1>
        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            className="w-full py-3 px-6 font-semibold text-lg rounded-lg shadow-md focus:outline-none transition duration-300"
          >
            Create Room
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