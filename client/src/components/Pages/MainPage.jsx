import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:4000', {
  transports: ['websocket'],
  withCredentials: true
});

function MainPage() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.get('http://localhost:4000/access/token', { withCredentials: true });
        setAccessToken(response.data.accessToken);
        console.log("Fetched access token:", response.data.accessToken);
      } catch (error) {
        console.error('Error fetching access token:', error.message);
      }
    };

    fetchAccessToken();

    socket.on('connect', () => {
      console.log("Socket Connected");
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log("Socket Disconnected");
      setSocketConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []); // Empty dependency array to run this effect only once

  const handleCreateRoom = () => {
    if (socketConnected) {
      if (!accessToken) {
        console.error("Access token is required.");
        return;
      }
  
      socket.emit('createRoom', accessToken, (response) => {
        console.log('Server response:', response); // Debug log
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

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:4000/logout', { withCredentials: true });
      navigate('/login'); // Navigate to login page after logout
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <div>
      {socketConnected ? (
        <button onClick={handleCreateRoom}>Create Room</button>
      ) : (
        <button disabled>Create Room (Connecting...)</button>
      )}
      <button onClick={handleJoinRoom}>Join Room</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default MainPage;
