import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { songs as initialSongs } from "../data/songs";

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [songs, setSongs] = useState(initialSongs);
  const [currentSong, setCurrentSong] = useState(null);
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

  // Initialize YouTube IFrame API
  useEffect(() => {
    // Create hidden div for player
    const div = document.createElement("div");
    div.id = "youtube-player-container";
    div.style.display = "none";
    document.body.appendChild(div);

    // Load script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-player-container", {
        height: "0",
        width: "0",
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
          setCurrentTime(playerRef.current.getCurrentTime());
          setDuration(playerRef.current.getDuration());
        }
      }, 500);
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

  const playSong = useCallback(
    (song, playlist = null) => {
      if (!isPlayerReady) return;
      
      if (playlist) {
        setQueue(playlist);
        const idx = playlist.findIndex((s) => s.id === song.id);
        setQueueIndex(idx >= 0 ? idx : 0);
      } else {
        if (!queue.find((s) => s.id === song.id)) {
          setQueue([song]);
          setQueueIndex(0);
        }
      }
      setCurrentSong(song);
      playerRef.current.loadVideoById(song.youtubeId);
      playerRef.current.playVideo();
      setIsPlaying(true);
    },
    [queue, isPlayerReady]
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
    setCurrentSong(nextSong);
    playerRef.current.loadVideoById(nextSong.youtubeId);
    playerRef.current.playVideo();
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
    setCurrentSong(prevSong);
    playerRef.current.loadVideoById(prevSong.youtubeId);
    playerRef.current.playVideo();
  }, [queue, queueIndex, isPlayerReady]);

  const seekTo = useCallback((time) => {
    if (!isPlayerReady || !playerRef.current) return;
    playerRef.current.seekTo(time, true);
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
