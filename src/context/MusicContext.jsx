import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
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
  
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const storedLikes = localStorage.getItem(`fm_liked_${u.uid}`);
        if (storedLikes) setLikedSongs(JSON.parse(storedLikes));
        const storedPlaylists = localStorage.getItem(`fm_playlists_${u.uid}`);
        if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));
      } else {
        setLikedSongs(initialSongs.filter((s) => s.liked).map((s) => s.id));
        setPlaylists([]);
      }
    });
    return () => unsub();
  }, []);

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

  const silentAudioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Acquire Wake Lock to prevent device from sleeping and killing audio
  const acquireWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (e) {
        // Wake Lock not supported or denied — fallback to silent audio
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  // Re-acquire wake lock when tab becomes visible again (e.g. user unlocks screen)
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        await acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPlaying]);

  useEffect(() => {
    // Silent HTML5 Audio (keeps browser audio session alive on iOS/Android)
    const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
    audio.loop = true;
    audio.volume = 0.001; // near-inaudible
    silentAudioRef.current = audio;

    // AudioContext oscillator at 0 gain — keeps audio thread awake on Android Chrome
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0; // completely silent
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audioCtxRef.current = ctx;
    } catch (e) {
      // AudioContext not supported
    }

    return () => {
      audio.pause();
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
      releaseWakeLock();
    };
  }, []);

  // Polling for currentTime and duration + background keep-alive
  useEffect(() => {
    let interval;
    if (isPlaying && isPlayerReady) {
      // Start silent audio to keep OS audio session alive (critical for iOS)
      if (silentAudioRef.current) {
        silentAudioRef.current.play().catch(() => {});
      }
      // Resume AudioContext if suspended (Android Chrome)
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      // Request Wake Lock
      acquireWakeLock();

      interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const offset = currentSongRef.current?.startSeconds || 0;
          const rawTime = playerRef.current.getCurrentTime() || 0;
          const rawDuration = playerRef.current.getDuration() || 0;
          setCurrentTime(Math.max(0, rawTime - offset));
          setDuration(Math.max(0, rawDuration - offset));
        }
      }, 250);
    } else {
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
      }
      releaseWakeLock();
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
      // 3. Network search as last resort (YouTube API / Invidious / allorigins)
      if (!finalYoutubeId) {
        try {
          const query = encodeURIComponent(songToPlay.artist + ' ' + songToPlay.title + ' official audio');

          const fetchWithTimeout = (url, ms) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), ms);
            return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
          };

          let found = false;

          // 3a. Try YouTube Data API v3 if key is configured
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

          // 3b. Fallback: Invidious API Instances
          if (!found) {
            const invidiousInstances = [
              'inv.thepixora.com',
              'invidious.jing.rocks',
              'invidious.nerdvpn.de'
            ];
            for (const instance of invidiousInstances) {
              if (found) break;
              try {
                const res = await fetchWithTimeout(`https://${instance}/api/v1/search?q=${query}&type=video`, 5000);
                if (res.ok) {
                  const data = await res.json();
                  if (data && data.length > 0 && data[0].videoId) {
                    finalYoutubeId = data[0].videoId;
                    songToPlay.youtubeId = finalYoutubeId;
                    found = true;
                  }
                }
              } catch (_) { /* ignore and try next instance */ }
            }
          }

          // 3c. Fallback: allorigins scrape
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
      // Avoid replaying the same song
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (queue.length > 1 && nextIndex === queueIndex);
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
    }

    // Always continue playing — even when reaching the end of the queue
    // (repeatMode=all loops, repeatMode=none also loops back so music never stops)
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
    setLikedSongs((prev) => {
      const next = prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId];
      if (user) localStorage.setItem(`fm_liked_${user.uid}`, JSON.stringify(next));
      return next;
    });
  }, [user]);

  const createPlaylist = useCallback((name) => {
    if (!name.trim()) return;
    setPlaylists((prev) => {
      const next = [...prev, { id: Date.now().toString(), name, songs: [] }];
      if (user) localStorage.setItem(`fm_playlists_${user.uid}`, JSON.stringify(next));
      return next;
    });
  }, [user]);

  const addSongToPlaylist = useCallback((playlistId, songId) => {
    setPlaylists((prev) => {
      const next = prev.map(p => {
        if (p.id === playlistId && !p.songs.includes(songId)) {
          return { ...p, songs: [...p.songs, songId] };
        }
        return p;
      });
      if (user) localStorage.setItem(`fm_playlists_${user.uid}`, JSON.stringify(next));
      return next;
    });
  }, [user]);

  const removeSongFromPlaylist = useCallback((playlistId, songId) => {
    setPlaylists((prev) => {
      const next = prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, songs: p.songs.filter(id => id !== songId) };
        }
        return p;
      });
      if (user) localStorage.setItem(`fm_playlists_${user.uid}`, JSON.stringify(next));
      return next;
    });
  }, [user]);

  const deletePlaylist = useCallback((playlistId) => {
    setPlaylists((prev) => {
      const next = prev.filter(p => p.id !== playlistId);
      if (user) localStorage.setItem(`fm_playlists_${user.uid}`, JSON.stringify(next));
      return next;
    });
  }, [user]);

  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => {
    setRepeatMode((m) => (m === "none" ? "all" : m === "all" ? "one" : "none"));
  };

  const isLiked = (id) => likedSongs.includes(id);

  // Sync Media Session API (lockscreen/notification controls)
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: "FakhriMusic",
        artwork: [
          { src: currentSong.cover || 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (playerRef.current) playerRef.current.playVideo();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (playerRef.current) playerRef.current.pauseVideo();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrev();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (handleNextRef.current) handleNextRef.current();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        seekTo(details.seekTime);
      });
    }
  }, [currentSong, handlePrev, seekTo]);

  // Sync Playback state and Position to MediaSession
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      if (duration > 0 && currentTime >= 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: 1.0,
            position: currentTime
          });
        } catch (e) { /* ignore if out of bounds */ }
      }
    }
  }, [isPlaying, currentTime, duration]);

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
        playlists,
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
        createPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        deletePlaylist,
        isLiked,
        isPlayerReady
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
