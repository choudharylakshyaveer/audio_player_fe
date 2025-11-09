// src/components/audio_player/components/context/AudioPlayerContext.jsx
import React, { createContext, useContext, useState } from "react";

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [trackImage, setTrackImage] = useState(null);

  const playTrackList = (list, index) => {
    setPlaylist(list);
    setCurrentIndex(index);
    setCurrentTrack(list[index]);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= playlist.length) {
      if (isLooping) nextIndex = 0; // restart from first track
      else return; // stop playback
    }
    setCurrentIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const playPrev = () => {
    if (playlist.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (isLooping) prevIndex = playlist.length - 1; // jump to last
      else return;
    }
    setCurrentIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const toggleLoop = () => setIsLooping((prev) => !prev); // 🔁 NEW toggle

  return (
    <AudioPlayerContext.Provider
      value={{
        playlist,
        currentIndex,
        currentTrack,
        isPlaying,
        setIsPlaying,
        playTrackList,
        playNext,
        playPrev,
        isLooping,
        toggleLoop,
        trackImage,
        setTrackImage

      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export const useAudioPlayer = () => useContext(AudioPlayerContext);
