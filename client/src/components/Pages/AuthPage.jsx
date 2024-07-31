

function AuthPage() {
  const spotifyAuth = () => {
    const apiUrl = "http://localhost:4000";
    window.location.href = `${apiUrl}/auth/spotify`;
  };

  

  return (
    <div>
      <button onClick={spotifyAuth}>Authenticate with Spotify</button>
    </div>
  );
}

export default AuthPage;
