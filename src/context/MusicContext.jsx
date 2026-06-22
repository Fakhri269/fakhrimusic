import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { songs as initialSongs } from "../data/songs";
import { findInCache } from "../data/ytCache";

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [songs, setSongs] = useState(initialSongs);
  const [currentSong, setCurrentSongState] = useState(null);
  const currentSongRef = useRef(null);

  const setCurrentSong = (song) => {
    setCurrentSongState(song);
    currentSongRef.current = song;
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none"); // none, one, all
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [likedSongs, setLikedSongs] = useState(
    initialSongs.filter((s) => s.liked).map((s) => s.id)
  );

  const playerRef = useRef(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const isPlayerReadyRef = useRef(false);

  // Initialize YouTube IFrame API
  useEffect(() => {
    // Create hidden div for player
    const div = document.createElement("div");
    div.id = "youtube-player-container";
    div.style.position = "absolute";
    div.style.top = "-9999px";
    div.style.left = "-9999px";
    div.style.width = "10px";
    div.style.height = "10px";
    div.style.opacity = "0";
    div.style.pointerEvents = "none";
    document.body.appendChild(div);

    // Load script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-player-container", {
        height: "10",
        width: "10",
        videoId: "",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: () => {
            setIsPlayerReady(true);
            isPlayerReadyRef.current = true;
            playerRef.current.setVolume(volume * 100);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleNextRef.current();
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          }
        }
      });
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      const container = document.getElementById("youtube-player-container");
      if (container) document.body.removeChild(container);
    };
  }, []);

  // Use a ref for handleNext to access latest state inside onStateChange
  const handleNextRef = useRef(null);

  // Polling for currentTime and duration
  useEffect(() => {
    let interval;
    if (isPlaying && isPlayerReady) {
      interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const offset = currentSongRef.current?.startSeconds || 0;
          const rawTime = playerRef.current.getCurrentTime() || 0;
          const rawDuration = playerRef.current.getDuration() || 0;
          
          setCurrentTime(Math.max(0, rawTime - offset));
          setDuration(Math.max(0, rawDuration - offset));
        }
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPlayerReady]);

  useEffect(() => {
    if (isPlayerReady && playerRef.current) {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume * 100);
      }
    }
  }, [volume, isMuted, isPlayerReady]);

  const loadAndPlayYoutubeVideo = useCallback(async (songToPlay) => {
    if (!isPlayerReadyRef.current || !playerRef.current) return;
    
    setCurrentSong(songToPlay);
    setIsPlaying(false); // Pause while loading
    
    let finalYoutubeId = songToPlay.youtubeId;
    if (!finalYoutubeId) {
      // 1. Check local songs.js
      const localMatch = initialSongs.find(
        (s) =>
          s.title.toLowerCase().includes(songToPlay.title.toLowerCase()) ||
          songToPlay.title.toLowerCase().includes(s.title.toLowerCase())
      );
      if (localMatch && localMatch.youtubeId) {
        finalYoutubeId = localMatch.youtubeId;
        songToPlay.youtubeId = finalYoutubeId;
      }

      // 2. Check ytCache (100+ pre-fetched songs)
      if (!finalYoutubeId) {
        const cached = findInCache(songToPlay.artist || '', songToPlay.title || '');
        if (cached) {
          finalYoutubeId = cached;
          songToPlay.youtubeId = finalYoutubeId;
        }
      }
      // 3. Network search as last resort (YouTube API / allorigins)
      if (!finalYoutubeId) {
        try {
          const query = encodeURIComponent(songToPlay.artist + ' ' + songToPlay.title + ' official audio');

          const fetchWithTimeout = (url, ms) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), ms);
            return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
          };

          let found = false;

          // Try YouTube Data API v3 if key is configured
          const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
          if (YT_API_KEY) {
            try {
              const res = await fetchWithTimeout(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${YT_API_KEY}`,
                6000
              );
              if (res.ok) {
                const data = await res.json();
                const videoId = data?.items?.[0]?.id?.videoId;
                if (videoId) {
                  finalYoutubeId = videoId;
                  songToPlay.youtubeId = finalYoutubeId;
                  found = true;
                }
              }
            } catch (_) { /* fall through */ }
          }

          // Fallback: allorigins scrape
          if (!found) {
            const proxyUrl = `https://api.allorigins.win/raw?url=https://m.youtube.com/results?search_query=${query}`;
            const res = await fetchWithTimeout(proxyUrl, 8000);
            if (res.ok) {
              const html = await res.text();
              const match = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
              if (match && match[1]) {
                finalYoutubeId = match[1];
                songToPlay.youtubeId = finalYoutubeId;
              }
            }
          }
        } catch (err) {
          console.warn("YouTube search failed:", err.name);
        }
      }
    }

    if (!finalYoutubeId) {
      alert(`Maaf, lagu "${songToPlay.title}" tidak dapat diputar.`);
      setIsPlaying(false);
      return;
    }

    playerRef.current.loadVideoById({
      videoId: finalYoutubeId,
      startSeconds: songToPlay.startSeconds || 0
    });
    playerRef.current.playVideo();
    setIsPlaying(true);
  }, []);

  const playSong = useCallback(
    (song, playlist = null) => {
      if (!isPlayerReadyRef.current) return;
      
      if (playlist) {
        setQueue(playlist);
        const idx = playlist.findIndex((s) => s.id === song.id);
        setQueueIndex(idx >= 0 ? idx : 0);
      } else {
        setQueue([song]);
        setQueueIndex(0);
      }
      
      loadAndPlayYoutubeVideo(song);
    },
    [loadAndPlayYoutubeVideo]
  );

  const togglePlay = useCallback(() => {
    if (!isPlayerReady || !playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    // Note: setIsPlaying will also be updated by onStateChange
    setIsPlaying(!isPlaying);
  }, [isPlaying, isPlayerReady]);

  const handleNext = useCallback(() => {
    if (!isPlayerReady || !playerRef.current) return;

    if (repeatMode === "one") {
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
      return;
    }
    if (queue.length === 0) return;

    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
    }

    if (nextIndex === 0 && repeatMode === "none" && !isShuffled) {
      playerRef.current.stopVideo();
      setIsPlaying(false);
      return;
    }

    const nextSong = queue[nextIndex];
    setQueueIndex(nextIndex);
    loadAndPlayYoutubeVideo(nextSong);
  }, [queue, queueIndex, isShuffled, repeatMode, isPlayerReady]);

  // Update ref so YT events use the latest function
  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  const handlePrev = useCallback(() => {
    if (!isPlayerReady || !playerRef.current) return;

    if (playerRef.current.getCurrentTime() > 3) {
      playerRef.current.seekTo(0);
      return;
    }
    if (queue.length === 0) return;
    const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
    const prevSong = queue[prevIndex];
    setQueueIndex(prevIndex);
    loadAndPlayYoutubeVideo(prevSong);
  }, [queue, queueIndex, isPlayerReady]);

  const seekTo = useCallback((time) => {
    if (!isPlayerReady || !playerRef.current) return;
    const offset = currentSongRef.current?.startSeconds || 0;
    playerRef.current.seekTo(time + offset, true);
    setCurrentTime(time);
  }, [isPlayerReady]);

  const toggleLike = useCallback((songId) => {
    setLikedSongs((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  }, []);

  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => {
    setRepeatMode((m) => (m === "none" ? "all" : m === "all" ? "one" : "none"));
  };

  const isLiked = (id) => likedSongs.includes(id);

  return (
    <MusicContext.Provider
      value={{
        songs,
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffled,
        repeatMode,
        queue,
        likedSongs,
        playSong,
        togglePlay,
        handleNext,
        handlePrev,
        seekTo,
        setVolume,
        setIsMuted,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        isLiked,
        isPlayerReady
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
