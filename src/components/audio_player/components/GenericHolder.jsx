import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ApiService from "../../common/ApiService";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import Card from "./Card";
import "../static/ScaleBurst.css";

export default function GenericHolder() {
  const [searchParams] = useSearchParams();
  const [tracks, setTracks] = useState([]);
  const { playTrackList } = useAudioPlayer();
  const [toast, setToast] = useState(null); 
  
  const type = searchParams.get("type");
  const columnName = searchParams.get("columnName");
  const filterValue = searchParams.get("filterValue");
  const playlistId = searchParams.get("playlistId");

  useEffect(() => {
    
    async function fetchData() {
      try {
        let response;
        if (type === "COLUMN") {
          response = await ApiService.get(
            `/column/${columnName}/${filterValue}`,
            {},
            "RESOURCE"
          );
        } else if (type === "PLAYLIST") {
          response = await ApiService.get(
            `/playlist/${playlistId}`,
            {},
            "RESOURCE"
          );
        }

        const data = response?.data || response || [];
        setTracks(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("Error fetching tracks:", err);
      }
    }
    fetchData();

    
  }, [type, columnName, filterValue, playlistId]);

  const handlePlay = (index) => {
    if (!tracks.length) return;
    playTrackList(tracks, index);
  };

  const handleRemoveTrack = async (playlistId, trackId) => {
  try {
    await ApiService.delete(`/playlist/${playlistId}/removeTrack/${trackId}`, {}, "RESOURCE");
     const trackName = getTrackNameById(trackId); // 👈 get name before removing
    setTracks((prev) => prev.filter((t) => t.id !== trackId));

    setToast({
      type: "success",
      message: `🎶 “${trackName}” removed successfully!`,
    });
    setTimeout(() => {
  const toastEl = document.querySelector(".fixed.bottom-6");
  if (toastEl) toastEl.classList.add("toast-exit");
  setTimeout(() => setToast(null), 400); // wait for fade-out
}, 2500);
  } catch (err) {
    setToast({
      type: "error",
      message: "Failed to remove track 😢",
    });
    setTimeout(() => {
  const toastEl = document.querySelector(".fixed.bottom-6");
  if (toastEl) toastEl.classList.add("toast-exit");
  setTimeout(() => setToast(null), 400); // wait for fade-out
}, 2500);
  }
};

const getTrackNameById = (trackId) => {
  const track = tracks.find((t) => t.id === trackId);
  return (
    track?.title ||
    track?.fileName?.replace(".flac", "") ||
    "Unknown Track"
  );
};

  return (
    <>
      {toast && (
    <div
      className={`fixed bottom-6 right-6 flex items-center gap-3 max-w-sm px-5 py-3 rounded-2xl shadow-2xl 
                  text-white text-sm font-semibold border-l-4 transition-all duration-500 ease-in-out
                  z-[9999] backdrop-blur-md 
                  ${toast.type === "success"
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-300"
                    : "bg-gradient-to-br from-rose-500 to-red-600 border-rose-300"
                  } animate-fadeSlideUp`}
    >
      <span className="text-xl">
        {toast.type === "success" ? "✅" : "❌"}
      </span>
      <span>{toast.message}</span>
    </div>
  )}

    <div className="p-6 bg-white dark:bg-slate-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {type === "PLAYLIST"
          ? `🎵 Playlist — ${playlistId}`
          : `🎧 ${columnName || ""}: ${filterValue || ""}`}
      </h2>

      {tracks.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-10">
          No tracks found.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {tracks.map((track, index) => {
            const title =
              track.title ||
              track.fileName?.replace(".flac", "") ||
              "Untitled Track";
            const artist =
              track.artists?.[0] ||
              track.albumArtist ||
              track.composer ||
              "Unknown Artist";

            return (
              <Card key={track.id}>
                <div onClick={() => handlePlay(index)} className="relative">
                  {/* Album Art */}
                  <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-200 text-sm rounded-t-xl">
                    🎵 {artist.charAt(0)}
                  </div>

                  {/* Delete Button */}
                  {type === "PLAYLIST" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const btn = e.currentTarget;

                        // Restart animation
                        btn.classList.remove("scale-burst");
                        void btn.offsetWidth; // force reflow
                        btn.classList.add("scale-burst");
                         handleRemoveTrack(playlistId, track.id)
                        
                      }}
                      title="Delete Playlist"
                      className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center
               rounded-full bg-gradient-to-br from-red-500 to-red-600
               dark:from-red-600 dark:to-red-700 text-white font-bold
               shadow-md hover:shadow-lg z-20"
                    >
                      ✕
                    </button>
                  )}

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {title}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-200 truncate">
                      {artist}
                    </p>
                    {track.album && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {track.album}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
