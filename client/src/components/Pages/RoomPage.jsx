import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

function RoomPage() {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const socket = io('http://localhost:4000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    // Listen for the connect event
    socket.on('connect', () => {
      console.log('Socket connected');
      // Attempt to join the room after connecting
      socket.emit('joinRoom', accessToken, roomId, (response) => {
        if (!response.success) {
          console.error('Error joining room:', response.message);
          return;
        }
        console.log('Successfully joined room');
      });
    });

    // Listen for the initial list of users in the room
    socket.on('roomUsers', (initialUsers) => {
      console.log('Initial users:', initialUsers);
      setUsers(initialUsers); // Update local state with initial users
    });

    // Handle the 'newUserJoined' event
    socket.on('newUserJoined', (newUser) => {
      console.log('New user joined:', newUser);
    });

    // Handle the 'userLeft' event
    socket.on('userLeft', (leftUser) => {
      console.log('User left:', leftUser);
      setUsers((prevUsers) => prevUsers.filter((user) => user.name !== leftUser.name)); // Remove user from the list
    });

    // Cleanup on unmount
    return () => {
      socket.off('newUserJoined');
      socket.off('userLeft');
      socket.off('roomUsers');
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
          {users.map((user, index) => (
            <li key={index} className="mb-2">
              {user}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RoomPage;
