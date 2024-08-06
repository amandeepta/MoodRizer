function AuthPage() {
  const spotifyAuth = () => {
    const apiUrl = "http://localhost:4000";
    window.open(`${apiUrl}/auth/spotify`, "_self");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Welcome to Our App</h1>
        <p className="text-lg text-gray-300 mb-8">
          Click the button below to authenticate with Spotify and get started!
        </p>
        <button
          onClick={spotifyAuth}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
        >
          Authenticate with Spotify
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
