import React, { createContext, useContext, useState } from "react";

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [trackImage, setTrackImage] = useState(null);

  // Add one track safely (no duplication)
  const addTrackToPlaylist = (track) => {
    if (!track) return;

    const existsIndex = playlist.findIndex((t) => String(t.id) === String(track.id));
    if (existsIndex !== -1) return;

    setPlaylist((prev) => [...prev, track]);
  };

  // Add multiple tracks safely (no duplication)
  const addTracksToPlaylist = (tracks) => {
    if (!Array.isArray(tracks) || tracks.length === 0) return;

    const filtered = tracks.filter((t) => !playlist.some((p) => String(p.id) === String(t.id)));
    if (filtered.length > 0) {
      setPlaylist((prev) => [...prev, ...filtered]);
    }
  };

  // Play multiple items freshly (clears old playlist)
  const playTrackList = (list, index = 0) => {
    if (!Array.isArray(list) || list.length === 0) return;
    setPlaylist(list);
    setCurrentIndex(index);
    setCurrentTrack(list[index]);
    setIsPlaying(true);
  };

  // ➤ New: play a single track (add if not exist, then play)
const playOrAddAndPlay = (track) => {
  if (!track) return;

  const existsIndex = playlist.findIndex(
    (t) => String(t.id) === String(track.id)
  );

  if (existsIndex !== -1) {
    setCurrentIndex(existsIndex);
    setCurrentTrack(track);   // ✅ FIX
    setIsPlaying(true);
    return;
  }

  setPlaylist((prev) => [...prev, track]);
  setCurrentIndex(playlist.length);
  setCurrentTrack(track);     // ✅ ALWAYS THIS
  setIsPlaying(true);
};



  // ➤ New: clear playlist + add multiple tracks + play first
  const playAllSelected = (tracks) => {
    if (!Array.isArray(tracks) || tracks.length === 0) return;
    setPlaylist(tracks);
    setCurrentIndex(0);
    setCurrentTrack(tracks[0]);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) {
      if (isLooping) nextIndex = 0;
      else return;
    }
    setCurrentIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const playPrev = () => {
    if (playlist.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (isLooping) prevIndex = playlist.length - 1;
      else return;
    }
    setCurrentIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const toggleLoop = () => setIsLooping((prev) => !prev);

  return (
    <AudioPlayerContext.Provider
      value={{
        playlist,
        setPlaylist,
        currentIndex,
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        playTrackList,
        playNext,
        playPrev,
        isLooping,
        toggleLoop,
        trackImage,
        setTrackImage,
        addTrackToPlaylist,
        addTracksToPlaylist,
        playOrAddAndPlay,
        playAllSelected,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export const useAudioPlayer = () => useContext(AudioPlayerContext);
