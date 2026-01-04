// src/components/audio_player/PlayerBar.jsx
import React, { useEffect, useRef, useState } from "react";
import API_BASE_URL from "../../config";
import { useAudioPlayer } from "./context/AudioPlayerContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Trash2,
  Repeat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import TrackListDrawer from "./components/TrackListDrawer";
import ApiService from "../common/ApiService";

export default function PlayerBar() {
  const audioRef = useRef(null);

  const {
    currentTrack,
    playlist,
    setPlaylist,
    isPlaying,
    setIsPlaying,
    playNext,
    playPrev,
    isLooping,
    toggleLoop,
  } = useAudioPlayer();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const refreshingRef = useRef(false);

  // Load new track
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    const audio = audioRef.current;
    let cancelled = false;

    const loadTrack = async () => {
      try {
        audio.pause();
        audio.src = "";
        audio.load();

        // 1️⃣ Request short-lived stream token (JWT is sent via fetch)
        const { token } = await ApiService.post(
          `/stream/token/${currentTrack.id}`,
          null,
          { type: "RESOURCE" }
        );

        if (cancelled) return;

        // 2️⃣ Attach token to stream URL
        const flacUrl =
          `${API_BASE_URL.RESOURCE_URL}/stream/flac/${currentTrack.id}` +
          `?token=${encodeURIComponent(token)}`;

        audio.src = flacUrl;
        audio.load();
        await audio.play();
      } catch (err) {
        console.error("Failed to load track", err);
      }
    };

    loadTrack();

    return () => {
      cancelled = true;
      refreshingRef.current = false;
      audio.pause();
      audio.src = "";
      audio.load();
    };
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isPlaying ? audio.play().catch(console.error) : audio.pause();
  }, [isPlaying]);

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

  const handleStreamError = async () => {
    if (refreshingRef.current) return;

    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    console.warn("Stream error detected");

    refreshingRef.current = true;
    const resumeTime = audio.currentTime || 0;

    try {
      const { token } = await ApiService.post(
        `/stream/token/${currentTrack.id}`,
        null,
        { type: "RESOURCE" }
      );

      audio.src =
        `${API_BASE_URL.RESOURCE_URL}/stream/flac/${currentTrack.id}` +
        `?token=${encodeURIComponent(token)}`;

      audio.load();
      audio.currentTime = resumeTime;
      await audio.play();
    } catch (err) {
      console.error("Token refresh failed", err);
      setIsPlaying(false);
    } finally {
      refreshingRef.current = false;
    }
  };

  const handleEnded = () => {
    if (isLooping) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else playNext();
  };

  const handleSeek = (e) => {
    const newProgress = Number(e.target.value);
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (newProgress / 100) * duration;
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
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleStreamError}
        className="hidden"
      />

      {/* MAIN PLAYER BAR */}
      <div className="px-3 pt-1 pb-1 flex flex-col items-center border-t border-slate-700 select-none">
        {/* Expand / collapse */}
        <div
          className="w-full flex justify-center cursor-pointer py-0.5"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>

        {/* Time & Now Playing */}
<div className="w-full max-w-3xl flex justify-between items-center mb-0.5 px-1">
  <span className="text-[10px] text-gray-400">
    {formatTime(currentTime)} / {formatTime(duration)}
  </span>
</div>

{/* Title + Album (Side by Side) */}
<div className="w-full max-w-3xl mb-1 flex items-center justify-between px-1 gap-2">
  


  {/* Album / Movie / Show Title (80%) */}
  <div className="w-[80%] overflow-hidden relative">
    <div className="whitespace-nowrap animate-marquee text-yellow-400 font-bold text-xs leading-tight">
      {currentTrack?.album_movie_show_title || "Unknown album"}
    </div>
  </div>
</div>


        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 accent-yellow-500 rounded-lg appearance-none cursor-pointer bg-slate-700 mb-2"
        />

        {/* CONTROLS (compact mode) */}
        <div className="flex items-center justify-center gap-6 pb-1">
          {/* Loop */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={toggleLoop}
            className={`p-1 rounded transition
    ${isLooping ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`}
            title={isLooping ? "Loop ON" : "Loop OFF"}
          >
            <Repeat size={18} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={playPrev}
            className="p-1 hover:text-yellow-400"
          >
            <SkipBack size={22} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.12 }}
            animate={isPlaying ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={() => setIsPlaying((p) => !p)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black rounded-full p-3 shadow-xl"
          >
            {isPlaying ? <Pause size={26} /> : <Play size={26} />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={playNext}
            className="p-1 hover:text-yellow-400"
          >
            <SkipForward size={22} />
          </motion.button>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed bottom-24 left-0 right-0 bg-slate-800 text-white rounded-t-xl z-[60] shadow-2xl"
            initial={{ opacity: 0, y: 300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 300 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            drag="y"
            dragElastic={0.35}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) setExpanded(false);
            }}
          >
            <div className="flex justify-end p-4">
              <motion.button
                onClick={() => setPlaylist([])}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 shadow-md flex items-center justify-center"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>

            <h3 className="font-bold text-lg mb-3 px-4 text-yellow-400">
              Up Next ({playlist.length})
            </h3>

            <div className="max-h-[55vh] overflow-y-auto px-4 pb-6">
              <TrackListDrawer />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
