import { useParams } from 'react-router-dom';

function RoomPage() {
  const { roomId } = useParams();

  return (
    <div className='flex flex-col align-top justify-center bg-black'>
      <h1 className='text-white'>{roomId}</h1>
      <p className='text-white'>Welcome to the room. Here you can create your customized favorite playlist.</p>
    </div>
  );
}

export default RoomPage;
