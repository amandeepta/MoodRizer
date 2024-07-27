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
  const id = localStorage.getItem('spotifyId'); 
  const [accessToken, setAccessToken] = useState('');
  const [roomId, setRoomId] = useState('');
  console.log(roomId);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/access', {
          headers : {
            id
          }
        });
        setAccessToken(response.data.accessToken);
      } catch (error) {
        console.error('Error fetching access token:', error.message);
      }
    };

    fetchAccessToken();

    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
    });

    return () => {
      socket.off('connect');
    };
  }, []);

  const handleCreateRoom = async () => {
    if (socketConnected) {
      try {
        const response = await new Promise((resolve, reject) => {
          socket.emit('createRoom', accessToken, (data) => {
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
          navigate(`/room/${response.roomId}`);
        } else {
          console.error('Failed to create room:', response.message);
        }
      } catch (error) {
        console.error('Error creating room:', error.message);
      }
    } else {
      console.log("Socket not connected. Please wait...");
    }
  };

  const handleJoinRoom = () => {
    navigate('/join');
  };

  return (
    <div>
      {socketConnected ? (
        <button onClick={handleCreateRoom}>Create Room</button>
      ) : (
        <button disabled>Create Room (Connecting...)</button>
      )}
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
}

export default MainPage;
