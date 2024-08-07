import { useContext } from 'react';
import UserContext from '../../UserContext';

function RoomPage() {
  const { users } = useContext(UserContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-center p-8">
      <h1 className="text-4xl font-extrabold text-white mb-6">
        Room Users
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Here are the users currently in the room:
      </p>

      <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Users List:</h2>
        <ul className="space-y-4">
          {users.length > 0 ? (
            users.map((user, index) => (
              <li key={index} className="flex items-center space-x-4 bg-gray-700 p-4 rounded-lg">
                <img
                  src={user.imageUrl || '/default-avatar.png'} // Use a default image if imageUrl is not available
                  alt={`${user.name}'s avatar`}
                  className="w-12 h-12 rounded-full border-2 border-gray-600"
                />
                <span className="text-white text-lg font-semibold">{user.name}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-400">No users in the room.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default RoomPage;
