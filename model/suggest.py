import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

client_id = "f7b0496b943c43c2b57959e1e61fad8a"
client_secret = "64d8545e31aa4e729add206b8980d14a"

client_credentials_manager = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

def fetch_track_details(track_id):
    track = sp.track(track_id)
    artist = track['artists'][0]['name']
    track_name = track['name']
    return f"{track_name} by {artist}"

def recommend_songs(input_songs, mood=None):
    recommended_tracks = []
    
    for input_song in input_songs:
        results = sp.search(q=input_song, type='track', limit=1)
        
        if results['tracks']['items']:
            input_track_id = results['tracks']['items'][0]['id']
            input_track_name = fetch_track_details(input_track_id)
            
            seed_tracks = [input_track_id]
            
            if mood:
                # Modify seed_tracks or use mood-related parameters in sp.recommendations()
                recommendations = sp.recommendations(seed_tracks=seed_tracks, limit=20, target_valence=get_valence_for_mood(mood))
            else:
                recommendations = sp.recommendations(seed_tracks=seed_tracks, limit=20)
                
            related_track_names = [fetch_track_details(track['id']) for track in recommendations['tracks']]
            recommended_tracks.extend(related_track_names)
        else:
            print(f"No results found for '{input_song}'")
    
    return recommended_tracks

def get_valence_for_mood(mood):
    # Define mapping of mood to Spotify's target valence range (0.0 to 1.0)
    mood_valence_map = {
        'happy': 0.8,
        'sad': 0.3,
        'chill': 0.5
        # Add more mappings as needed
    }
    
    # Return the corresponding valence value for the mood, default to neutral if not found
    return mood_valence_map.get(mood.lower(), 0.5)

# Example usage:
input_songs = ['she by zayn', 'believer by imagine dragons']
mood = 'chill'  # Example mood

recommended_songs = recommend_songs(input_songs, mood=mood)

if recommended_songs:
    print(f"Songs similar to '{input_songs}' for mood '{mood}':")
    for song in recommended_songs:
        print(song)
else:
    print(f"No recommendations found for '{input_songs}' and mood '{mood}'. Please try other songs or moods.")
