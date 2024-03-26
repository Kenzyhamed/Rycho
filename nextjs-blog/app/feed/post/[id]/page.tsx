"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Song {
  name: string;
  artist: string;
  album: string;
  image: string;
  audioUrl: string; 
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string; 
}

interface User {
  spotifyId: string;
}

export default function PostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [spotifyId, setSpotifyId] = useState<string | null>(null);
  const [showAlbums, setShowAlbums] = useState(true);
  const [showBackButton, setShowBackButton] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<Playlist | null>(null); 
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [caption, setCaption] = useState('');
  const [recommendations, setRecommendedSongs] = useState<Song[]>([]);




  const filteredAlbums = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const playPreview = (audioUrl: string) => {
    if (audioPlayer) {
      if (audioPlayer.src !== audioUrl) {
        audioPlayer.src = audioUrl;
        audioPlayer.play();
      } else {
        if (audioPlayer.paused) {
          audioPlayer.play();
        } else {
          audioPlayer.pause();
        }
      }
    }
  };

  useEffect(() => {
    const newAudioPlayer = new Audio();
    setAudioPlayer(newAudioPlayer);

    return () => {
      if (newAudioPlayer) {
        newAudioPlayer.pause();
        newAudioPlayer.src = '';
      }
    };
  }, []);


  useEffect(() => {
    setFilteredPlaylists(playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [searchQuery, playlists]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };


  useEffect(() => {
    const fetchToken = () => {
      const storedToken = window.localStorage.getItem("token");
      setToken(storedToken);
    }

    fetchToken();
  }, []);

  useEffect(() => {
    const storedSpotifyId = window.localStorage.getItem("spotifyId");
    if (params.id) {
      setSpotifyId(params.id);
    } else if (storedSpotifyId) {
      setSpotifyId(storedSpotifyId);
    } else {
    }
  }, [params]);


  useEffect(() => {
    if (token) {
      const fetchPlaylists = async () => {
        try {
          const { data } = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: {
              Authorization: 'Bearer ' + token
            }
          });

          const playlistsData: Playlist[] = data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            image: item.images[0].url, 
          }));

          setPlaylists(playlistsData);
          setFilteredPlaylists(playlistsData);
          setShowBackButton(false)
        } catch (error) {
          console.error("Error fetching playlists: ", error);
        }
      }

      fetchPlaylists();
    }
  }, [token]);

  const fetchPlaylistSongs = async (playlistId: string) => {
    try {
      const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });

      const extractedSongs: Song[] = data.items.map((item: any) => ({
        name: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        image: item.track.album.images.length > 0 ? item.track.album.images[0].url : '',
        audioUrl: item.track.preview_url
        
      }));

      setPlaylistSongs(extractedSongs);
      setSelectedPlaylistId(playlistId);
      setShowAlbums(false);
      setShowBackButton(true);

      // Fetch recommendations based on the fetched playlist songs
      const recommendations = await getRecommendations(extractedSongs);
      setRecommendedSongs(recommendations); // Update state with recommended songs
    } catch (error) {
      console.error("Error fetching songs for playlist: ", error);
    }
  }
  
  const getRecommendations = async (playlistSongs: Song[]) => {
    try {
      // Extract track IDs from playlist songs
      const seedTracks = playlistSongs.map(song => song.name).join(',');
      console.log("Seed Tracks:", seedTracks);
      const { data } = await axios.get('https://api.spotify.com/v1/recommendations', {
        params: {
          seed_tracks: seedTracks,
          limit: 3, // You can adjust the limit as per your requirement
        },
        headers: {
          Authorization: 'Bearer ' + token
        }
      });
  
      const recommendedSongs: Song[] = data.tracks.map((track: any) => ({
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        image: track.album.images.length > 0 ? track.album.images[0].url : '',
        audioUrl: track.preview_url
      }));
  
      return recommendedSongs;
    } catch (error) {
      console.error("Error fetching recommendations: ", error);
      return []; // Return an empty array in case of error
    }
  }
  
  

  const handlePostSong = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedSong) {
      try {
        const response = await axios.post("http://localhost:3000/api/feed/post", {
          method: "addPost",
          spotifyId: spotifyId, 
          songName: selectedSong.name,
          albumName: selectedSong.album, 
          artistName: selectedSong.artist, 
          imageURL: selectedSong.image, 
          audioURL: selectedSong.audioUrl, 
          caption: caption, 
          likes: 0,
          roomStat: false,
          comments: [],
        });

        console.log("Song posted successfully:", response.data);
      } catch (error) {
        console.error("Error posting song:", error);
      }
    } else {
      console.warn("No song selected to post.");
    }
    router.push(`/profile/${spotifyId}`);
  };
  

  const handleBackToAlbums = () => {
    setShowAlbums(true);
    setShowBackButton(false)
    setSelectedAlbum(null);
  };

  const handleOpenPopup = (song: Song) => {
    setSelectedSong(song);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setSelectedSong(null);
    setShowPopup(false);
  };

  return (
    <div className="flex flex-col items-center m-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder={`Search ${selectedAlbum ? selectedAlbum.name : 'Album'}...`}
          className="bg-gray-200 mt-3 mr-4 pl-4 pr-8 py-1 rounded-full focus:outline-none focus:ring focus:border-blue-300 max-w-104 text-black"
          value={searchQuery}
          onChange={handleInputChange}
        />
        {/* Button to go back */}
        <button
          onClick={handleBackToAlbums}
          className="mb-4 ml-4 w-10 h-10 bg-gray-500 text-white rounded-full hover:bg-gray-600 items-center justify-center focus:outline-none focus:ring-2 focus:text-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block align-middle" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 1.414L7.414 10l6.293 6.293a1 1 0 01-1.414 1.414l-7-7a1 1 0 010-1.414l7-7a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap justify-center">
        {/* Playlists */}
        {showAlbums ? (
          filteredAlbums.map((playlist, index) => (
            <div key={index} className="m-4 cursor-pointer" onClick={() => {
              fetchPlaylistSongs(playlist.id);
              setSelectedAlbum(playlist); // Set the selected album when clicked
              setSearchQuery(""); // Clear search query when album is selected
            }}>
              <img src={playlist.image} alt={playlist.name} className="w-40 h-40 object-cover rounded-lg mb-2" />
              <p className="text-center">{playlist.name}</p>
            </div>
          ))
        ) : (
          // Render songs of selected album only
          <div className="flex flex-col items-center m-4">
  
            {/* Render filtered songs based on search query */}
            <ul>
              {playlistSongs
                .filter(song =>
                  song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  song.artist.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((song, index) => (
                  <li
                    key={index}
                    className={`cursor-pointer mb-2 flex items-center ${selectedSong === song ? 'bg-gray-300' : ''}`}
                    onClick={() => {
                      setSelectedSong(prevSong => (prevSong === song ? null : song));
                    }}
                  >
                  {/* Post button */}
                  {selectedSong === song && (
                      <button
                        className="mr-2 text-black focus:outline-none group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPopup(true);
                        }}
                      >
                        POST
                      </button>
                    )}
                    <img src={song.image} alt={song.name} className="w-12 h-12 object-cover rounded-lg mr-2" />
                    <div>
                      <p className={`text-base font-semibold ${selectedSong === song ? 'text-gray-800' : ''}`}>{song.name}</p>
                      <p className={`text-xs ${selectedSong === song ? 'text-gray-800' : ''}`}>{song.artist}</p>
                    </div>
                    {/* Play/pause button */}
                    <button
                      className="ml-auto mr-4 text-gray-600 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the row selection event from triggering
                        playPreview(song.audioUrl);
                      }}
                    >
                      {/* SVG triangle icon for play button with rounder tips */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {selectedSong === song ? (
                          // Three lines for pause
                          <>
                            <rect x="4" y="6" width="4" height="12" />
                            <rect x="14" y="6" width="4" height="12" />
                          </>
                        ) : (
                          // Play triangle with rounder tips
                          <path  strokeLinejoin="round" strokeWidth={2} d="M4 6l16 6-16 6z" />
                        )}
                      </svg>
                    </button>
                  </li>
                ))}
            </ul>
  
            {/* Post song popup */}
            {showPopup && (
              <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center popup-background" onClick={handleClosePopup}>
                <div className="bg-white p-4 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
                  <img src={selectedSong?.image} alt={selectedSong?.name} className="w-40 h-40 object-cover rounded-lg mb-2" />
                  <p className="text-base font-semibold text-black mb-1">{selectedSong?.name}</p>
                  <p className="text-sm text-black mb-2">{selectedSong?.artist}</p>
                  <input
                    type="text"
                    placeholder="Enter caption..."
                    className="border-b border-black text-black rounded-none px-2 py-1 w-full"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <button onClick={handlePostSong} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-2">
                    Post Song
                  </button>
                </div>
              </div>
            )}
  
            {/* Recommended songs */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Recommended Songs</h2>
              <ul>
                {recommendations.map((song, index) => (
                  <li key={index} className="mb-2">
                    {song.name} - {song.artist}
                  </li>
                ))}
              </ul>
            </div>
  
          </div>
        )}
      </div>
    </div>
  );
  
  
}