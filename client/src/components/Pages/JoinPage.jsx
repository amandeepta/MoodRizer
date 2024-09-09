import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function JoinPage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = async () => {
    if (roomId.trim() === '') {
      alert('Please enter a room ID');
      return;
    }

    try {
      const response = await axios.post('https://mood-rizer-backend.onrender.com/access/check', {
        roomId: roomId
      });

      if (response.data.success) {
        navigate(`/room/${roomId}`);
      } else {
        alert('Room ID does not exist');
      }
    } catch (error) {
      console.error('Error checking room ID:', error.message);
      alert('There was an error checking the room ID');
    }
  };

  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="bg-gray-900 bg-opacity-90 text-white p-10 rounded-lg shadow-2xl w-full max-w-md space-y-6">
        <h1 className="text-4xl font-extrabold text-green-400 text-center">
          Join a Room
        </h1>
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={handleRoomIdChange}
            className="w-full p-4 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-green-400 transition duration-300"
          />
        </div>
        <button
          onClick={handleJoinRoom}
          className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}

export default JoinPage;
