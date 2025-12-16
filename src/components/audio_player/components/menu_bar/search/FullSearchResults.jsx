// src/components/audio_player/components/search/.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ApiService from "../../../../common/ApiService";
import { fetchImageById } from "../../../../common/fetchImageById";

export default function FullSearchReslts({
  query = "",
  visible = false,
  onClose = () => {},
  onFullResults = () => {},
}) {
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    albums: [],
    artists: [],
    audioTracks: [],
  });

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      if (!debouncedQuery.trim()) {
        setResults({ albums: [], artists: [], audioTracks: [] });
        return;
      }

      setLoading(true);

      try {
        const res = await ApiService.get(`/search?q=${encodeURIComponent(debouncedQuery)}`);


        if (cancelled) return;

        const { albums = [], artists = [], audioTracks = [] } = res;

        // Fetch tiny images for everything
        const enrich = async (arr) =>
          await Promise.all(
            arr.map(async (item) => ({
              ...item,
              tinyImg: await fetchImageById(item.id),
            }))
          );

        const enriched = {
          albums: await enrich(albums.slice(0, 4)),
          artists: await enrich(artists.slice(0, 4)),
          audioTracks: await enrich(audioTracks.slice(0, 4)),
        };

        if (!cancelled) setResults(enriched);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadResults();
    return () => (cancelled = true);
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    if (!visible) return;

    const onDoc = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };

    const onEsc = (e) => e.key === "Escape" && onClose();

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [visible, onClose]);

  // Card UI
  const Card = ({ item, title, subtitle }) => (
    <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer">
      <img
        src={item.tinyImg}
        className="w-8 h-8 rounded object-cover bg-slate-300 dark:bg-slate-600"
      />
      <div className="flex-1 overflow-hidden">
        <div className="text-sm font-semibold truncate text-slate-900 dark:text-white">
          {title}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-300 truncate">
          {subtitle}
        </div>
      </div>
    </div>
  );

  const Section = (label, arr, type) =>
    arr.length > 0 && (
      <div className="mb-3">
        <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
          {label}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {arr.map((item) => {
            const title =
              item.album ||
              item.title ||
              item.album_movie_show_title ||
              "Unknown";

            const subtitle = item.artists?.[0] || item.album || "";

            return (
              <Card item={item} title={title} subtitle={subtitle} key={item.id} />
            );
          })}
        </div>
      </div>
    );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute left-0 right-0 top-[64px] z-[110] pointer-events-none flex justify-center"
        >
          <div
            ref={containerRef}
            className="pointer-events-auto w-[90%] max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-black/5 dark:border-white/5 overflow-hidden flex flex-col max-h-[50vh]"
          >
            {/* Header */}
            <div className="p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Search results
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-300">
                  {debouncedQuery ? `Top matches for "${debouncedQuery}"` : ""}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="p-3 overflow-y-auto">
              {loading && (
                <div className="text-sm text-center p-3 text-slate-500">
                  Loading...
                </div>
              )}

              {!loading && (
                <>
                  {Section("Albums", results.albums, "albums")}
                  {Section("Artists", results.artists, "artists")}
                  {Section("Tracks", results.audioTracks, "audioTracks")}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex justify-center">
              <button
                onClick={onFullResults}
                className="bg-slate-900 text-white dark:bg-white dark:text-black px-3 py-1 rounded text-sm hover:opacity-80"
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
