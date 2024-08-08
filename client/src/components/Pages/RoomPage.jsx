import { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import UserContext from '../../UserContext';

// Create socket instance inside the component
const socket = io('http://localhost:4000');

function RoomPage() {
  const { roomId } = useParams();
  const { users, addUser } = useContext(UserContext);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    // Join the room when the component mounts
    socket.emit('joinRoom', accessToken, roomId, (response) => {
      if (!response.success) {
        console.error('Error joining room:', response.message);
        return;
      }
      console.log('Successfully joined room');
    });

    // Handle the 'newUserJoined' event
    socket.on('newUserJoined', (newUser) => {
      console.log('New user joined:', newUser);
      addUser(newUser);
    });

    // Handle the 'userLeft' event
    socket.on('userLeft', (leftUser) => {
      console.log('User left:', leftUser);
      const updatedUsers = users.filter((user) => user.name !== leftUser.name);
      addUser(updatedUsers);
    });

    // Cleanup on unmount
    return () => {
      socket.off('newUserJoined');
      socket.off('userLeft');
    };
  }, [accessToken, roomId, addUser, users]);

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
              <img src={user.imageUrl} alt={`${user.name}'s avatar`} className="inline-block w-6 h-6 rounded-full mr-2" />
              {user.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RoomPage;