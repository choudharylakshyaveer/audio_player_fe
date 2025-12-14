// src/components/audio_player/components/search/SearchDropdown.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../../../common/ApiService";
import { fetchImageById } from "../../../../common/fetchImageById";
import { useAudioPlayer } from "../../../context/AudioPlayerContext";

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

// Normalize playable track (must match GenericHolder / PlayerBar)
function buildTrack(item) {
  return {
    id: String(item.id),
    title: item.title || item.album_movie_show_title || "Unknown",
    album_movie_show_title: item.album_movie_show_title || "",
    artists: item.artists || [],
    cover: item.image || "",
  };
}

// Album already has base64 image from API
function buildAlbumItem(item) {
  return {
    album: item.album,
    image: item.attachedPicture
      ? `data:image/jpeg;base64,${item.attachedPicture}`
      : "/default_album.png",
  };
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
      <img
        src={image}
        className="w-9 h-9 rounded-md object-cover"
        alt={title}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }) {
  if (!children || children.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="text-xs font-bold uppercase mb-1 text-slate-500">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
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

  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [data, setData] = useState({
    albums: [],
    artists: [],
    audioTracks: [],
  });

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

        // Albums → image already present
        const albums = (res.albums || [])
          .slice(0, 4)
          .map(buildAlbumItem);

        // Artists & Tracks → fetch image
        const enrich = async (item) => ({
          ...item,
          image: await fetchImageById(item.id),
        });

        const artists = await Promise.all(
          (res.artists || []).slice(0, 4).map(enrich)
        );

        const audioTracks = await Promise.all(
          (res.audioTracks || []).slice(0, 6).map(enrich)
        );

        setData({ albums, artists, audioTracks });
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

    document.addEventListener("mousedown", close);
    document.addEventListener(
      "keydown",
      (e) => e.key === "Escape" && onClose()
    );

    return () => document.removeEventListener("mousedown", close);
  }, [visible]);

  /* -------------------- Handlers -------------------- */

  const handlePlayTrack = (track) => {
    playOrAddAndPlay(buildTrack(track));
    onClose();
  };

  const handleAlbumClick = (albumName) => {
    if (!albumName) return;
    onClose();
    navigate(`/audio-player/generalList?type=ALBUM&albumName=${encodeURIComponent(albumName)}`);  };

  const handleArtistClick = (artistName) => {
    console.log("handleArtistClick:", artistName);
    if (!artistName) return;
    onClose();
    navigate(`/audio-player/generalList?type=COLUMN&columnName=artists&filterValue=${encodeURIComponent(artistName)}`);

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
                  <Section label="Albums">
                    {data.albums.map((a) => (
                      <ResultCard
                        key={a.album}
                        image={a.image}
                        title={a.album}
                        onClick={() => handleAlbumClick(a.album)}
                      />
                    ))}
                  </Section>

                  <Section label="Artists">
                    {data.artists.map((a) => (
                      <ResultCard
                        key={a.id}
                        image={a.image}
                        title={a.artists?.[0]}
                        onClick={() => handleArtistClick(a.artists?.[0])}
                      />
                    ))}
                  </Section>

                  <Section label="Tracks">
                    {data.audioTracks.map((t) => (
                      <ResultCard
                        key={t.id}
                        image={t.image}
                        title={t.title || t.album_movie_show_title}
                        subtitle={t.artists?.[0]}
                        onClick={() => handlePlayTrack(t)}
                      />
                    ))}
                  </Section>
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
