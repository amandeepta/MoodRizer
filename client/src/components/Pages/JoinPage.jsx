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
      const response = await axios.post('http://localhost:4000/access/check', {
        roomId
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Join a Room</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={handleRoomIdChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleJoinRoom}
          className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-300"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}

export default JoinPage;
