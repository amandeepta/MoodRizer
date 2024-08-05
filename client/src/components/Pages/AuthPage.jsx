

function AuthPage() {
  const spotifyAuth = () => {
    const apiUrl = "http://localhost:4000";
    window.open(
      `${apiUrl}/auth/spotify`, 
      "_self"
    );
  };

  

  return (
    <div>
      <button onClick={spotifyAuth}>Authenticate with Spotify</button>
    </div>
  );
}

export default AuthPage;
