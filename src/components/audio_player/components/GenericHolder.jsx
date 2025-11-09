import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ApiService from "../../common/ApiService";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import Card from "./Card";

export default function GenericHolder() {
  const [searchParams] = useSearchParams();
  const [tracks, setTracks] = useState([]);
  const { playTrackList } = useAudioPlayer();

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

  return (
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
              track.title || track.fileName?.replace(".flac", "") || "Untitled Track";
            const artist =
              track.artists?.[0] || track.albumArtist || track.composer || "Unknown Artist";

            return (
              <Card key={track.id} onClick={() => handlePlay(index)}>
                {/* Track placeholder / album art */}
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-200 text-sm">
                  🎵 {artist.charAt(0)}
                </div>
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
