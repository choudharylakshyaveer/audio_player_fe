import React, { useEffect, useRef, useState } from "react";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import ApiService from "../../common/ApiService";
import PlaylistDialog from "./playlist/AddToPlaylistDialog";
import { fetchImageById } from "../../common/fetchImageById";

export default function AllSongs() {
  const { playOrAddAndPlay } = useAudioPlayer();

  const [search, setSearch] = useState("");
  const [tracks, setTracks] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [playlistTrackId, setPlaylistTrackId] = useState(null);

  const [images, setImages] = useState({}); // 🔑 image cache

  const debounceRef = useRef(null);
  const longPressRef = useRef(null);

  /* -------------------- Debounced Search -------------------- */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(0), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  /* -------------------- Fetch Tracks -------------------- */
  useEffect(() => {
    setLoading(true);
    setExpandedId(null);

    ApiService.get("/tracks", {
      queryParams: {
        search,
        page,
        size,
        sortBy: "title",
        direction: "asc",
      },
    })
      .then((res) => {
        setTracks([...res.audioTracks]);
        setTotal(res.totalTracks || 0);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  /* -------------------- Fetch Images -------------------- */
  useEffect(() => {
    tracks.forEach((track) => {
      if (!images[track.id]) {
        fetchImageById(track.id).then((img) => {
          setImages((prev) => ({ ...prev, [track.id]: img }));
        });
      }
    });
  }, [tracks]);

  /* -------------------- Handlers -------------------- */
  const handlePlay = (track) => playOrAddAndPlay(track);

  const handleToggleDetails = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleLongPressStart = (trackId) => {
    longPressRef.current = setTimeout(() => {
      setPlaylistTrackId(trackId);
    }, 600);
  };

  const handleLongPressEnd = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  const totalPages = Math.ceil(total / size);

  /* -------------------- Render -------------------- */
  return (
    <div className="p-4 max-w-3xl mx-auto pb-32">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tracks..."
        className="w-full p-3 rounded-xl border dark:bg-slate-900 dark:border-slate-700 mb-4"
      />

      {loading && <div className="text-gray-400 text-sm">Loading...</div>}

      <div className="space-y-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="border rounded-lg p-3 hover:bg-yellow-50 dark:hover:bg-slate-800 cursor-pointer"
            onClick={() => handlePlay(track)}
            onMouseDown={() => handleLongPressStart(track.id)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
          >
            <div className="flex items-center gap-3">
              {/* Album Art */}
              <img
                src={images[track.id] || "/default_album.png"}
                alt={track.title}
                className="w-10 h-10 rounded-md object-cover flex-shrink-0"
              />

              {/* Expand */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleDetails(track.id);
                }}
                className="text-gray-400 hover:text-yellow-500"
              >
                {expandedId === track.id ? "▾" : "▸"}
              </button>

              {/* Title */}
              <span className="font-medium truncate">
                {track.album_movie_show_title}
              </span>
            </div>

            {expandedId === track.id && (
              <div className="mt-2 text-sm text-gray-500 grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <b>Title:</b> {track.title}
                </div>
                <div>
                  <b>Album:</b> {track.album}
                </div>

                <div>
                  <b>Artists:</b>{" "}
                  {track.artists?.length ? track.artists.join(", ") : "-"}
                </div>
                <div>
                  <b>Album Artist:</b> {track.albumArtist || "-"}
                </div>

                <div>
                  <b>Genre:</b> {track.genre || "-"}
                </div>
                <div>
                  <b>Year:</b> {track.year || "-"}
                </div>

                <div>
                  <b>Format:</b> {track.format?.toUpperCase()}
                </div>
                <div>
                  <b>Bitrate:</b> {track.bitRate || "-"}
                </div>

                <div>
                  <b>Lossless:</b> {track.lossless ? "Yes" : "No"}
                </div>
                <div>
                  <b>Duration:</b>{" "}
                  {track.trackLength ? `${track.trackLength}s` : "-"}
                </div>

                <div>
                  <b>File:</b> {track.fileName}
                </div>
                <div>
                  <b>Extension:</b> {track.fileExtension}
                </div>

                {track.composer && (
                  <div className="col-span-2">
                    <b>Composer:</b> {track.composer}
                  </div>
                )}

                {track.comments && (
                  <div className="col-span-2">
                    <b>Comments:</b> {track.comments}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            ◀
          </button>

          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </span>

          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            ▶
          </button>
        </div>
      )}

      {playlistTrackId && (
        <PlaylistDialog
          trackId={playlistTrackId}
          onClose={() => setPlaylistTrackId(null)}
        />
      )}
    </div>
  );
}
