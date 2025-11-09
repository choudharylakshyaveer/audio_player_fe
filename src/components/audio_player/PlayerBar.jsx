// src/components/audio_player/components/PlayerBar.jsx
import React, { useEffect, useRef, useState } from "react";
import API_BASE_URL from "../../config";
import { useAudioPlayer } from "./context/AudioPlayerContext";
import { Play, Pause, SkipBack, SkipForward, PlusCircle } from "lucide-react";
import PlaylistDialog from "./components/playlist/PlaylistDialog";

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

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);

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

  // ▶️ Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => console.error("Playback error:", err));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // ⏱️ Sync progress
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

  const handleSeek = (e) => {
    const newProgress = Number(e.target.value);
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = (newProgress / 100) * duration;
    audio.currentTime = newTime;
    setProgress(newProgress);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* 🎶 Audio Element (hidden) */}
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* 🎚️ Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white px-5 py-4 flex flex-col items-center shadow-[0_-2px_20px_rgba(0,0,0,0.6)] border-t border-slate-700 z-50">
        {/* Track info */}
        <div className="w-full max-w-3xl flex items-center justify-between text-sm mb-2">
          <div className="truncate font-semibold text-yellow-400">
            {currentTrack ? currentTrack.title : "No track selected"}
          </div>
          <div className="text-gray-400 text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Seekbar */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className="w-full max-w-3xl h-2 accent-yellow-500 rounded-lg appearance-none cursor-pointer bg-slate-700"
        />

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-3">
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

          {/* ➕ Add to Playlist button */}
          {currentTrack && (
            <button
              onClick={() => setShowPlaylistDialog(true)}
              className="p-2 hover:text-yellow-400 transition-colors flex items-center gap-1"
              title="Add to Playlist"
            >
              <PlusCircle size={24} />
            </button>
          )}
        </div>
      </div>

      {/* 🪟 Playlist Dialog */}
      {showPlaylistDialog && currentTrack && (
        <PlaylistDialog
          trackId={currentTrack.id}
          onClose={() => setShowPlaylistDialog(false)}
        />
      )}
    </>
  );
}
