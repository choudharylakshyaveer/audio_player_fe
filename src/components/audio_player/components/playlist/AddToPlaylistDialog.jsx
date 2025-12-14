// src/components/audio_player/components/PlaylistDialog.jsx
import React, { useEffect, useState } from "react";
import ApiService from "../../../common/ApiService";

export default function PlaylistDialog({ trackId, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylist, setNewPlaylist] = useState("");

  useEffect(() => {
    ApiService.get("/playlist", {}, "RESOURCE")
      .then(setPlaylists)
      .catch(() => setPlaylists([]));
  }, []);

  const handleAddToExisting = (playlistId) => {
    ApiService.post(`/playlist/${playlistId}/addTrack/${trackId}`, {}, "RESOURCE")
      .then(() => onClose())
      .catch((err) => console.error("Failed to add track:", err));
  };

  const handleCreateAndAdd = () => {
    if (!newPlaylist.trim()) return;
    ApiService.post(`/playlist?name=${encodeURIComponent(newPlaylist)}`, {}, "RESOURCE")
      .then((res) =>
        ApiService.post(`/playlist/${res.id}/addTrack/${trackId}`, {}, "RESOURCE")
      )
      .then(() => onClose())
      .catch((err) => console.error("Failed to create playlist:", err));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-80 shadow-xl">
        <h2 className="text-lg font-semibold mb-3 text-center text-yellow-500">
          Add to Playlist
        </h2>

        <div className="max-h-40 overflow-y-auto mb-3">
          {playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => handleAddToExisting(p.id)}
              className="w-full text-left p-2 rounded hover:bg-yellow-100 dark:hover:bg-slate-700"
            >
              🎵 {p.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            placeholder="New playlist name"
            value={newPlaylist}
            onChange={(e) => setNewPlaylist(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={handleCreateAndAdd}
            className="bg-yellow-500 px-3 rounded text-black font-semibold"
          >
            ➕
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-gray-400 text-sm hover:text-gray-700 w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
