import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
  transports: ['websocket'], // Ensures WebSocket transport is used
  withCredentials: true // Allows credentials for CORS
});

function MainPage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [socketConnected, setSocketConnected] = useState(false); // Track socket connection state

  // Connect to the socket server on component mount (improved clarity)
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true); // Update state to indicate successful connection
    });

    // Clean up the socket connection on component unmount
    return () => socket.off('connect');
  }, []);

  const handleCreateRoom = async () => {
    if (socketConnected) { // Ensure socket connection before emitting
      try {
        const response = await new Promise((resolve, reject) => {
          socket.emit('createRoom', (data) => {
            if (data.success) {
              resolve(data);
            } else {
              reject(new Error(data.message));
            }
          });
        });

        if (response.success) {
          setRoomId(response.roomId);
          console.log(`Created room with ID: ${response.roomId}`);
          navigate(`/room/${roomId}`);
        } else {
          console.error('Failed to create room:', response.message);
        }
      } catch (error) { // Handle potential errors during emission or response
        console.error('Error creating room:', error.message);
      }
    } else {
      console.log("Socket Not connected. Please wait...");
    }
  };

  const handleJoinRoom = () => {
    navigate('/join');
  };

  return (
    <div>
      {socketConnected ? ( // Conditionally render buttons based on connection status
        <button onClick={handleCreateRoom}>Create Room</button>
      ) : (
        <button disabled>Create Room (Connecting...)</button>
      )}
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
}

export default MainPage;
