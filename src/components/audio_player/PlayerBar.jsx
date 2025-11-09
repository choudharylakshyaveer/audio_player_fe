// src/components/audio_player/components/PlayerBar.jsx
import React, { useEffect, useRef, useState } from "react";
import API_BASE_URL from "../../config";
import { useAudioPlayer } from "./context/AudioPlayerContext";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

export default function PlayerBar() {
  const audioRef = useRef(null);
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    playNext,
    playPrev,
    isLooping,
  } = useAudioPlayer();

  const [progress, setProgress] = useState(0); // percentage
  const [duration, setDuration] = useState(0); // in seconds
  const [currentTime, setCurrentTime] = useState(0); // in seconds

  // 🎧 Load and play new track
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    const flacUrl = `${API_BASE_URL.RESOURCE_URL}/stream/flac/${currentTrack.id}`;
    console.log("🎧 Now playing:", flacUrl);

    const audio = audioRef.current;
    audio.src = flacUrl;
    audio.load();

    if (isPlaying) {
      audio.play().catch((err) => console.error("Playback error:", err));
    }
  }, [currentTrack]);

  // ▶️ Handle play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => console.error("Playback error:", err));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // ⏭️ Handle time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  const handleEnded = () => {
    if (isLooping) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      playNext();
    }
  };

  // ⏩ Seek manually
  const handleSeek = (e) => {
    const newProgress = Number(e.target.value);
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = (newProgress / 100) * duration;
    audio.currentTime = newTime;
    setProgress(newProgress);
  };

  // Format seconds → mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 flex flex-col items-center shadow-2xl border-t border-slate-700">
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* 🎶 Track Info */}
      <div className="w-full max-w-3xl flex items-center justify-between text-sm mb-2">
        <div className="truncate font-semibold">
          {currentTrack ? currentTrack.title : "No track selected"}
        </div>
        <div className="text-gray-400 text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* 🎚️ Custom Seekbar */}
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={progress}
        onChange={handleSeek}
        className="w-full max-w-3xl h-2 accent-yellow-500 rounded-lg appearance-none cursor-pointer bg-slate-700"
      />

      {/* ⏯️ Controls */}
      <div className="flex items-center gap-6 mt-3">
        <button
          onClick={playPrev}
          className="p-2 hover:text-yellow-400 transition-colors"
        >
          <SkipBack size={26} />
        </button>

        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black rounded-full p-3 transition-transform transform active:scale-90"
        >
          {isPlaying ? <Pause size={26} /> : <Play size={26} />}
        </button>

        <button
          onClick={playNext}
          className="p-2 hover:text-yellow-400 transition-colors"
        >
          <SkipForward size={26} />
        </button>
      </div>
    </div>
  );
}
