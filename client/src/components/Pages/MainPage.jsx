import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Cookies from 'js-cookie';

const socket = io('http://localhost:4000', {
  transports: ['websocket'],
  withCredentials: true
});

function MainPage() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState('');
  const [roomId, setRoomId] = useState('');
  console.log(roomId);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const token = Cookies.get('authToken');
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
  }, []);

  useEffect(() => {
    

    if (!accessToken) return;

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    return () => {
      socket.off('connect');
    };
  }, [accessToken]);

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
