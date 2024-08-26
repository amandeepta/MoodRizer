import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

function RoomPage() {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]); 
  const [message, setMessage] = useState(''); 
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    const socket = io('http://localhost:4000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit('joinRoom', accessToken, roomId, (response) => {
        if (response.success) {
          console.log("Joined the room successfully");
        } else {
          console.error('Error joining room:', response.message);
        }
      });
    });

    socket.on('newUserJoined', (usersList, newUser) => {
      console.log("new User Joined", newUser);
      setUsers(usersList);
      setMessage(`${newUser} has joined the room.`);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    });

    socket.on('userLeft', (leftUser, userleft) => {
      setUsers(leftUser);
      setMessage(`${userleft} has left the room.`);
      setTimeout(() => {
        setMessage('');
      }, 10000);
    });

    // Cleanup on unmount
    return () => {
      socket.off('newUserJoined');
      socket.off('userLeft');
      socket.disconnect();
    };
  }, [accessToken, roomId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-center p-8">
      <h1 className="text-4xl font-extrabold text-white mb-6">
        Room ID: {roomId}
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Welcome to the room. Enjoy your time here!
      </p>
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-white mb-4">Users in the room:</h2>
        <ul className="list-disc text-white">
          {users.length > 0 ? (
            users.map((user, index) => (
              <li key={index} className="mb-2">
                {user}
              </li>
            ))
          ) : (
            <li className="text-gray-400">No users in the room</li>
          )}
        </ul>
      </div>
      <div className="mt-6">
        <pre className="text-white whitespace-pre-wrap">{message}</pre>
      </div>
    </div>
  );
}

export default RoomPage;