
function Page() {
  const spotifyAuth = () => {
    const apiUrl = "http://localhost:4000";
    window.location.href = `${apiUrl}/auth/spotify`; // Redirect to Spotify authentication endpoint
  };

 
  return (
    <div>
      <button onClick={spotifyAuth}>Authenticate with Spotify</button>
    </div>
  );
}

export default Page;
