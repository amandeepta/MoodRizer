import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

function AuthPage() {
  const spotifyAuth = () => {
    const apiUrl = "http://localhost:4000";
    window.location.href = `${apiUrl}/auth/spotify`;
  };

  useEffect(() => {
    const handleAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        try {
          const decoded = jwtDecode(token);
          localStorage.setItem('spotifyId', decoded.spotifyId);
        } catch (e) {
          console.error('Failed to decode JWT:', e);
        }
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div>
      <button onClick={spotifyAuth}>Authenticate with Spotify</button>
    </div>
  );
}

export default AuthPage;
