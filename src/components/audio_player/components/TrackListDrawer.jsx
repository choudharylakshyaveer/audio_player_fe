// src/components/audio_player/components/TrackListDrawer.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "../context/AudioPlayerContext";

export default function TrackListDrawer({ compact = false }) {
  const {
    playlist = [],
    currentIndex,
    currentTrack,
    playTrackList,
    setCurrentTrack,
    setIsPlaying,
  } = useAudioPlayer();

  const handleClickTrack = (index) => {
    if (typeof playTrackList === "function") {
      playTrackList(playlist, index);
    } else {
      setCurrentTrack(playlist[index]);
      setIsPlaying(true);
    }
  };

  if (!Array.isArray(playlist) || playlist.length === 0) {
    return (
      <div className="p-4 text-center text-gray-300">
        No tracks in queue
      </div>
    );
  }

  return (
    <motion.div
      layout
      transition={{ duration: 0.25 }}
      className={`${compact ? "space-y-1" : "space-y-3"}`}
    >
      <AnimatePresence initial={false}>
        {playlist.map((t, i) => {
          if (!t || typeof t !== "object") return null;

          const title = t.title || t.fileName || `Track ${i + 1}`;
          const album = t.album || t.albumArtist || "";
          const artist = t.artists?.[0] || t.albumArtist || t.composer || "";

          const isCurrent =
            (currentTrack && String(currentTrack.id) === String(t.id)) ||
            currentIndex === i;

          return (
            <motion.div
              key={t.id ?? `track-${i}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileTap={{ scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              onClick={() => handleClickTrack(i)}
              className={`p-3 flex items-center justify-between rounded-xl cursor-pointer border
                backdrop-blur-sm select-none transition-all duration-200
                ${
                  isCurrent
                    ? "bg-yellow-600/30 border-yellow-500 shadow-lg scale-[1.03]"
                    : "bg-slate-700/40 hover:bg-slate-600/40 border-transparent"
                }
              `}
            >
              <div className="min-w-0">
                <div className="font-semibold text-gray-100 truncate text-sm">
                  {title}
                </div>
                {(album || artist) && (
                  <div className="text-xs text-gray-300 truncate mt-0.5">
                    {artist}
                    {album ? ` • ${album}` : ""}
                  </div>
                )}
              </div>

              <div
                className={`ml-4 text-xs font-bold ${
                  isCurrent ? "text-yellow-300 scale-110" : "text-gray-400"
                }`}
              >
                {isCurrent ? "▶" : `#${i + 1}`}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
