// src/components/audio_player/components/search/SearchDropdown.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../../../common/ApiService";
import { fetchImageById } from "../../../../common/fetchImageById";
import { useAudioPlayer } from "../../../context/AudioPlayerContext";

/* --------------------------------------------------
   Helpers (unchanged logic)
-------------------------------------------------- */

function buildTrack(item) {
  return {
    id: String(item.id),
    title: item.title || item.album_movie_show_title || "Unknown",
    album_movie_show_title: item.album_movie_show_title || "",
    artists: item.artists || [],
    cover: item.image || "",
  };
}

function buildAlbumItem(item) {
  return {
    album: item.album,
    image: item.attachedPicture
      ? `data:image/jpeg;base64,${item.attachedPicture}`
      : "/default_album.png",
  };
}

/* --------------------------------------------------
   Reusable hooks
-------------------------------------------------- */

function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

function useOutsideClick(ref, enabled, onClose) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) =>
      ref.current && !ref.current.contains(e.target) && onClose();

    const esc = (e) => e.key === "Escape" && onClose();

    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [enabled, onClose, ref]);
}

/* --------------------------------------------------
   UI atoms
-------------------------------------------------- */

function ResultCard({ image, title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-2 flex gap-3 items-center rounded-lg
                 hover:bg-slate-200 dark:hover:bg-slate-700
                 cursor-pointer transition"
    >
      {image ? (
        <img
          src={image}
          className="w-9 h-9 rounded-md object-cover"
          alt={title}
        />
      ) : (
        <div
          className="w-9 h-9 rounded-md bg-slate-300 dark:bg-slate-600
                  flex items-center justify-center text-xs font-bold"
        >
          {title?.[0]}
        </div>
      )}

      <div className="min-w-0">
        {title && <p className="text-sm font-semibold truncate">{title}</p>}

        {subtitle && (
          <p className="text-xs text-slate-400 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function Section({ label, items, renderItem }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="text-xs font-bold uppercase mb-1 text-slate-500">{label}</p>
      <div className="grid grid-cols-2 gap-2">{items.map(renderItem)}</div>
    </div>
  );
}

/* --------------------------------------------------
   Data fetcher
-------------------------------------------------- */

async function fetchSearchData(query) {
  const res = await ApiService.get("/search", {
  queryParams: { q: query }
});


  const enrichTrack = async (item) => ({
    ...item,
    image: await fetchImageById(item.id),
  });

  return {
    albums: (res.albums || []).slice(0, 4).map(buildAlbumItem),

    // ✅ artists are strings
    artists: (res.artists || []).slice(0, 6),

    audioTracks: await Promise.all(
      (res.audioTracks || []).slice(0, 6).map(enrichTrack)
    ),
  };
}

/* --------------------------------------------------
   Main component
-------------------------------------------------- */

export default function SearchDropdown({
  query = "",
  visible = false,
  onClose = () => {},
  onShowFull = () => {},
}) {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { playOrAddAndPlay } = useAudioPlayer();

  const debouncedQuery = useDebounce(query);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    albums: [],
    artists: [],
    audioTracks: [],
  });

  useOutsideClick(containerRef, visible, onClose);

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
        const result = await fetchSearchData(debouncedQuery);
        if (!cancelled) setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        !cancelled && setLoading(false);
      }
    })();

    return () => (cancelled = true);
  }, [debouncedQuery]);

  /* -------------------- Handlers -------------------- */

  const playTrack = (track) => {
    playOrAddAndPlay(buildTrack(track));
    onClose();
  };

  const openAlbum = (albumName) => {
    onClose();
    navigate(
      `/audio-player/generalList?type=ALBUM&albumName=${encodeURIComponent(
        albumName
      )}`
    );
  };

  const openArtist = (artistName) => {
    onClose();
    navigate(
      `/audio-player/generalList?type=COLUMN&columnName=artists&filterValue=${encodeURIComponent(
        artistName
      )}`
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
                  <Section
                    label="Albums"
                    items={data.albums}
                    renderItem={(a) => (
                      <ResultCard
                        key={a.album}
                        image={a.image}
                        title={a.album}
                        onClick={() => openAlbum(a.album)}
                      />
                    )}
                  />

                  <Section
                    label="Artists"
                    items={data.artists}
                    renderItem={(artist) => (
                      <ResultCard
                        key={artist}
                        title={artist}
                        onClick={() => openArtist(artist)}
                      />
                    )}
                  />

                  <Section
                    label="Tracks"
                    items={data.audioTracks}
                    renderItem={(t) => (
                      <ResultCard
                        key={t.id}
                        image={t.image}
                        title={t.title || t.album_movie_show_title}
                        subtitle={t.artists?.[0]}
                        onClick={() => playTrack(t)}
                      />
                    )}
                  />
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
