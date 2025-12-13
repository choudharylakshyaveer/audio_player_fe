// src/components/audio_player/components/search/SearchDropdown.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ApiService from "../../../../common/ApiService";
import { fetchImageById } from "../../../../common/fetchImageById";
import { useAudioPlayer } from "../../../context/AudioPlayerContext";

export default function SearchDropdown({
  query = "",
  visible = false,
  onClose = () => {},
  onShowFull = () => {},
}) {
  const containerRef = useRef(null);
  const { playOrAddAndPlay, playTrackList  } = useAudioPlayer();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ albums: [], artists: [], audioTracks: [] });
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  /* -------------------- Debounce -------------------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  /* -------------------- Fetch -------------------- */
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setData({ albums: [], artists: [], audioTracks: [] });
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await ApiService.get(`/search?q=${debouncedQuery}`);
        if (cancelled) return;

        const enrich = async (item) => ({
          ...item,
          image: await fetchImageById(item.id),
        });

        setData({
          albums: await Promise.all((res.albums || []).slice(0, 4).map(enrich)),
          artists: await Promise.all((res.artists || []).slice(0, 4).map(enrich)),
          audioTracks: await Promise.all((res.audioTracks || []).slice(0, 6).map(enrich)),
        });
      } catch (e) {
        console.error(e);
      } finally {
        !cancelled && setLoading(false);
      }
    })();

    return () => (cancelled = true);
  }, [debouncedQuery]);

  /* -------------------- Outside click -------------------- */
  useEffect(() => {
    if (!visible) return;

    const close = (e) =>
  containerRef.current &&
  !containerRef.current.contains(e.target) &&
  onClose();


    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => e.key === "Escape" && onClose());

    return () => document.removeEventListener("mousedown", close);
  }, [visible]);

  /* -------------------- PLAY (CRITICAL) -------------------- */
  const handlePlay = (item) => {
  if (!item?.id) return;

  const track = {
    id: String(item.id),
    title: item.title || item.album_movie_show_title || "Unknown",
    album_movie_show_title: item.album_movie_show_title || "",
    artists: item.artists || [],
    cover: item.image || "",
  };

  console.log("▶ Playing from SearchDropdown:", track);

  // EXACT SAME BEHAVIOR AS GenericHolder
  playTrackList([track], 0);

  onClose();
};


  /* -------------------- Card -------------------- */
  const ResultCard = ({ item, title, subtitle }) => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        handlePlay(item);}
      }
      className="p-2 flex gap-3 items-center rounded-lg
                 hover:bg-slate-200 dark:hover:bg-slate-700
                 cursor-pointer transition"
    >
      <img src={item.image} className="w-9 h-9 rounded-md object-cover" alt="" />
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
      </div>
    </div>
  );

  /* -------------------- Section -------------------- */
  const renderSection = (label, items, type) => {
    if (!items.length) return null;

    return (
      <div className="mb-3">
        <p className="text-xs font-bold uppercase mb-1 text-slate-500">{label}</p>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <ResultCard
              key={item.id}
              item={item}
              title={
                type === "audioTracks"
                  ? item.title || item.album_movie_show_title
                  : type === "albums"
                  ? item.album
                  : item.artists?.[0]
              }
              subtitle={type === "audioTracks" ? item.artists?.[0] : ""}
            />
          ))}
        </div>
      </div>
    );
  };

  /* -------------------- Render -------------------- */
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute left-0 right-0 top-[64px] z-[110] flex justify-center"
        >
          <div
            ref={containerRef}
            className="w-[90%] max-w-2xl bg-white dark:bg-slate-800
                       rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 flex justify-between border-b">
              <div>
                <p className="text-sm font-semibold">Search results</p>
                <p className="text-xs text-slate-400">
                  {debouncedQuery && `Top results for “${debouncedQuery}”`}
                </p>
              </div>
              <button onClick={onClose}>
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-3 max-h-[50vh] overflow-y-auto">
              {loading ? (
                <p className="text-center text-sm">Loading…</p>
              ) : (
                <>
                  {renderSection("Albums", data.albums, "albums")}
                  {renderSection("Artists", data.artists, "artists")}
                  {renderSection("Tracks", data.audioTracks, "audioTracks")}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t flex justify-center">
              <button
                onClick={onShowFull}
                className="text-sm px-3 py-1 rounded bg-slate-900 text-white"
              >
                Show full results
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
