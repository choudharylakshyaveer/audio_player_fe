// src/components/audio_player/components/GenericHolder.jsx
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ApiService from "../../common/ApiService";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import Card from "./Card";
import "../static/ScaleBurst.css";
import noAlbumArt from "../static/no_album_art.png";
import AddToPlaylistDialog from "./playlist/AddToPlaylistDialog"; // ⬅ added
import { motion, AnimatePresence } from "framer-motion"; // ⬅ added
import { fetchImageById } from "../../common/fetchImageById";

export default function GenericHolder() {
  const [searchParams] = useSearchParams();
  const [tracks, setTracks] = useState([]);
  const [trackImages, setTrackImages] = useState({});
  const [toast, setToast] = useState(null);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [albumArt, setAlbumArt] = useState("/default_album.png");

  // ⬇ Long-press state
  const [longPressTrack, setLongPressTrack] = useState(null); // ⬅ added
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false); // ⬅ added
  const longPressTimer = useRef(null); // ⬅ added

  const {
    playlist,
    currentTrack,
    addTrackToPlaylist,
    addTracksToPlaylist,
    playOrAddAndPlay,
    playAllSelected,
  } = useAudioPlayer();

  const type = searchParams.get("type");
  const columnName = searchParams.get("columnName");
  const filterValue = searchParams.get("filterValue");
  const playlistId = searchParams.get("playlistId");
  const albumName = searchParams.get("albumName");

  console.log("GenericHolder type:", type);
  console.log("GenericHolder columnName:", columnName);
  console.log("GenericHolder filterValue:", filterValue);
  console.log("GenericHolder playlistId:", playlistId);
  console.log("GenericHolder albumName:", albumName);

  const startLongPress = (event, track) => {
    event.preventDefault();
    longPressTimer.current = setTimeout(() => {
      setLongPressTrack(track); // Open menu
    }, 550);
  };

  const cancelLongPress = () => {
    clearTimeout(longPressTimer.current);
  };

  // const fetchImageById = async (id) => {
  //   try {
  //     const res = await ApiService.get(`/image/${id}`, {}, "RESOURCE");
  //     const base64 = typeof res === "string" ? res : res?.image;
  //     return base64 ? `data:image/jpeg;base64,${base64}` : "/default_album.png";
  //   } catch {
  //     return "/default_album.png";
  //   }
  // };

  useEffect(() => {
    if (type === "ALBUM" && albumName) {
      ApiService.get(`/albums/${albumName}`, {}, "RESOURCE")
        .then(async (res) => {
          const data = Array.isArray(res) ? res : res?.tracks || [];
          setTracks(data);
          if (data.length > 0) {
            const img = await fetchImageById(data[0].id);
            setAlbumArt(img);
          }
        })
        .catch(() => setTracks([]));
    }
  }, [type, albumName]);

  useEffect(() => {
    if (type === "ALBUM") return;

    const fetchData = async () => {
      try {
        let response;
        if (type === "COLUMN") {
          response = await ApiService.get(`/column/${columnName}/${filterValue}`, {}, "RESOURCE");
        } else if (type === "PLAYLIST") {
          response = await ApiService.get(`/playlist/${playlistId}`, {}, "RESOURCE");
        }

        const data = response?.data || response || [];
        const validTracks = Array.isArray(data) ? data : [data];
        setTracks(validTracks);

        validTracks.forEach(async (track) => {
          const img = await fetchImageById(track.id);
          setTrackImages((prev) => ({ ...prev, [track.id]: img }));
        });
      } catch (err) {
        console.error("Error fetching tracks:", err);
      }
    };
    fetchData();
  }, [type, columnName, filterValue, playlistId]);

  useEffect(() => {
    if (type === "ARTIST") return;

    const fetchData = async () => {
      try {
        let response;
        if (type === "COLUMN") {
          response = await ApiService.get(`/column/${columnName}/${filterValue}`, {}, "RESOURCE");
        } else if (type === "PLAYLIST") {
          response = await ApiService.get(`/playlist/${playlistId}`, {}, "RESOURCE");
        }

        const data = response?.data || response || [];
        const validTracks = Array.isArray(data) ? data : [data];
        setTracks(validTracks);

        validTracks.forEach(async (track) => {
          const img = await fetchImageById(track.id);
          setTrackImages((prev) => ({ ...prev, [track.id]: img }));
        });
      } catch (err) {
        console.error("Error fetching tracks:", err);
      }
    };
    fetchData();
  }, [type, columnName, filterValue, playlistId]);

  const handlePlay = (track) => {
    console.log("playOrAddAndPlay called with track:", track);
    if (!track) return;
    playOrAddAndPlay(track);
  };

  const handleAddToQueue = (track) => {
    const exists = playlist.some((p) => String(p.id) === String(track.id));

    if (exists) {
      setToast({ type: "info", message: `✔ Already in queue` });
      fadeOutToast();
      return;
    }

    addTrackToPlaylist(track);
    setToast({ type: "success", message: `➕ Added to queue` });
    fadeOutToast();
  };

  const handlePlayAll = () => {
    if (!tracks.length) return;
    playAllSelected(tracks);
  };

  const handleAddToCurrentAndClose = () => {
    handleAddToQueue(longPressTrack);
    setLongPressTrack(null);
  };

  const fadeOutToast = () => setTimeout(() => setToast(null), 2500);

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-2 rounded-lg text-white bg-green-600 shadow-lg z-[9999] animate-fadeSlideUp">
          {toast.message}
        </div>
      )}

      {/* --- LONG PRESS POPUP MENU --- */}
      <AnimatePresence>
        {longPressTrack && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-72 shadow-2xl space-y-3">
              <h2 className="text-center text-lg font-semibold text-yellow-500">
                {longPressTrack.title}
              </h2>

              <button
                onClick={handleAddToCurrentAndClose}
                className="w-full p-2 rounded bg-yellow-500 text-black font-bold"
              >
                ➕ Add to Current Queue
              </button>

              <button
                onClick={() => setShowPlaylistDialog(true)}
                className="w-full p-2 rounded bg-slate-700 text-white"
              >
                📂 Add to Playlist...
              </button>

              <button
                onClick={() => setLongPressTrack(null)}
                className="text-gray-400 text-sm mt-2 w-full"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPlaylistDialog && longPressTrack && (
        <AddToPlaylistDialog
          trackId={longPressTrack.id}
          onClose={() => {
            setShowPlaylistDialog(false);
            setLongPressTrack(null);
          }}
        />
      )}

      {/* ---------------- PAGE UI ---------------- */}
      <div className="p-6 bg-white dark:bg-slate-900 min-h-screen transition-colors overflow-x-hidden">
        <div className="space-y-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              onMouseDown={(e) => startLongPress(e, track)}
              onTouchStart={(e) => startLongPress(e, track)}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchEnd={cancelLongPress}
              onClick={() => handlePlay(track)}
              className={`flex items-center gap-3 p-3 rounded-lg shadow-sm cursor-pointer
                ${
                  currentTrack?.id === track.id
                    ? "bg-yellow-400 dark:bg-yellow-500"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
            >
              <img
                src={trackImages[track.id] || albumArt}
                className="w-12 h-12 object-cover rounded"
                alt=""
              />

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {track.title || track.fileName.replace(".flac", "")}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {track.artists?.[0] || "Unknown Artist"}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToQueue(track);
                }}
                className={`text-xl hover:scale-125 transition ${
                  playlist.some((p) => String(p.id) === String(track.id))
                    ? "text-green-500"
                    : "text-white"
                }`}
              >
                {/* {playlist.some((p) => String(p.id) === String(track.id)) ? "✔" : "➕"} */}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
  
}
