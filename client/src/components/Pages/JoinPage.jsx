import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function JoinPage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const accessToken = localStorage.getItem('accessToken');
  const handleJoinRoom = () => {
    if (roomId.trim() === '') {
      alert('Please enter a room ID');
      return;
    }
    
    socket.emit('joinRoom',accessToken, roomId, (response) => {
        if (response.success) {
          setRoomId(roomId);
          navigate(`/room/${roomId}`); 
        } else {
          console.error('Failed to join room:', response.message);
        }
      });
  };

  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={handleRoomIdChange}
      />
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
}

export default JoinPage;
