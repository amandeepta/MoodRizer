import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function RoomPage() {
  const { roomId } = useParams();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    socket.on('userInfo', (data) => {
      setUserInfo(data.userInfo);
    });

    socket.emit('joinRoom', roomId, (response) => {
      if (!response.success) {
        console.error('Failed to join room:', response.message);
      }
    });

    return () => {
      socket.off('userInfo');
    };
  }, [roomId]);

  return (
    <div>
      {userInfo && (
        <div>
          <h1>{userInfo.displayName}</h1>
          <img src={userInfo.profileImage} alt={`${userInfo.displayName}'s profile`} />
          <p>Favorite Genre: {userInfo.favoriteGenre}</p>
          <p>Least Favorite Genre: {userInfo.leastFavoriteGenre}</p>
          <p>Favorite Artist: {userInfo.favoriteArtist}</p>
        </div>
      )}
    </div>
  );
}

export default RoomPage;
