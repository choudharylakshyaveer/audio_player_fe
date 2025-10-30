// src/components/audio_player/components/PlayerBar.jsx
import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Repeat } from "lucide-react"; // 🔁 icon
import { useAudioPlayer } from "./context/AudioPlayerContext";

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    playNext,
    playPrev,
    setIsPlaying,
    isLooping,
    toggleLoop,
  } = useAudioPlayer();

  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  /** 🎵 Load new track with HLS */
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    const audio = audioRef.current;
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(currentTrack.playlistUrl);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        audio.play().catch(() => {});
        setIsPlaying(true);
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = currentTrack.playlistUrl;
      audio.play().catch(() => {});
      setIsPlaying(true);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [currentTrack]);

  /** 🎚️ Track progress updates */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      playNext();
      if (isLooping && !currentTrack) {
        // If playlist ended, start over
        playNext();
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, playNext, isLooping]);

  /** ▶️⏸️ Play / Pause toggle */
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  /** 🕓 Seekbar move */
  const handleSeek = (e) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  /** ⏱️ Format seconds to MM:SS */
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex flex-col items-center shadow-lg">
      <audio ref={audioRef} controls={false} />

      {/* 🔘 Controls */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <button
          onClick={playPrev}
          className="px-4 py-2 bg-yellow-400 text-black rounded-full shadow-md hover:bg-yellow-300 transition"
        >
          ⏮️
        </button>

        <button
          onClick={togglePlay}
          className="px-4 py-2 bg-yellow-400 text-black rounded-full shadow-md hover:bg-yellow-300 transition"
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>

        <button
          onClick={playNext}
          className="px-4 py-2 bg-yellow-400 text-black rounded-full shadow-md hover:bg-yellow-300 transition"
        >
          ⏭️
        </button>

        {/* 🔁 Loop Toggle Button */}
        <button
          onClick={toggleLoop}
          title="Toggle Loop"
          className={`px-3 py-2 rounded-full transition ${
            isLooping
              ? "bg-yellow-400 text-black shadow-md"
              : "bg-gray-700 text-white hover:bg-yellow-300"
          }`}
        >
          <Repeat size={20} />
        </button>
      </div>

      {/* 📈 Seekbar */}
      <div className="flex items-center w-full max-w-xl gap-2">
        <span className="text-xs text-gray-300 w-10 text-right">
          {formatTime(progress)}
        </span>

        <input
          type="range"
          min="0"
          max={duration || 0}
          value={progress}
          step="0.1"
          onChange={handleSeek}
          className="flex-1 cursor-pointer accent-yellow-400"
        />

        <span className="text-xs text-gray-300 w-10 text-left">
          {formatTime(duration)}
        </span>
      </div>

      {/* 🎶 Track Info */}
      <div className="text-sm mt-2 text-gray-300 truncate w-full text-center">
        🎵 {currentTrack.title}{" "}
        {currentTrack.artist ? `– ${currentTrack.artist}` : ""}
      </div>
    </div>
  );
}
