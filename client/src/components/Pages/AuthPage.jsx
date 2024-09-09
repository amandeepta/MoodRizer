function AuthPage() {
  const spotifyAuth = () => {
    const apiUrl = "https://mood-rizer-backend.onrender.com";
    window.open(`${apiUrl}/auth/spotify`, "_self");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="bg-gray-800 bg-opacity-80 p-10 rounded-lg shadow-2xl text-center">
        <h1 className="text-5xl font-extrabold text-green-400 mb-6">
          Welcome to MoodRizer
        </h1>
        <p className="text-lg text-gray-300 mb-4">
          MoodRizer is a collaborative music player
        </p>
        <p className="text-sm text-gray-500 mb-8">
          This app uses Spotify Authentication to play music via the Spotify Web SDK.
        </p>
        <p className="text-lg text-gray-200 mb-10">
          Click the button below to authenticate and start the experience!
        </p>
        <button
          onClick={spotifyAuth}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
        >
          Authenticate with Spotify
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
