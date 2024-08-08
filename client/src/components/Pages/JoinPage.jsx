import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

function JoinPage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState('');
  const accessToken = localStorage.getItem('accessToken');

  // Create socket instance inside the component
  const socket = io('http://localhost:4000', {
    transports: ['websocket'],
    withCredentials: true
  });

  useEffect(() => {
    // Handle socket connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
      setError('');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
      setError('Socket disconnected. Please try again later.');
    });

    // Cleanup on component unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []); // Add socket to dependency array

  const handleJoinRoom = () => {
    if (!socketConnected) {
      alert('Socket is not connected. Please try again later.');
      return;
    }

    if (roomId.trim() === '') {
      alert('Please enter a room ID');
      return;
    }

    socket.emit('joinRoom', accessToken, roomId, (response) => {
      if (response.success) {
        navigate(`/room/${roomId}`);
      } else {
        console.error('Failed to join room:', response.message);
        setError(`Failed to join room: ${response.message}`);
      }
    });
  };

  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Join a Room</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
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
          className={`w-full py-3 px-6 ${socketConnected ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'} text-white font-semibold rounded-lg shadow-md transition duration-300`}
          disabled={!socketConnected}
        >
          {socketConnected ? 'Join Room' : 'Connecting...'}
        </button>
      </div>
    </div>
  );
}

export default JoinPage;