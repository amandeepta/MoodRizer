import { useParams } from 'react-router-dom';

function RoomPage() {
  const { roomId } = useParams();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-center p-8">
      <h1 className="text-4xl font-bold text-white mb-4">
        Room ID: {roomId}
      </h1>
      <p className="text-lg text-gray-300">
        Welcome to the room. Here you can create your customized favorite playlist.
      </p>
    </div>
  );
}

export default RoomPage;
