// src/components/audio_player/components/AlbumDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../common/ApiService";
import { useAudioPlayer } from "../context/AudioPlayerContext";

export default function AlbumDetails() {
  const { albumName } = useParams();
  const [albumData, setAlbumData] = useState([]);
  const [albumArt, setAlbumArt] = useState("/default_album.png");
  const { playTrackList, currentTrack } = useAudioPlayer();

  useEffect(() => {
    if (!albumName) return;
    ApiService.get(`/albums/${albumName}`, {}, "RESOURCE")
      .then((res) => {
        if (Array.isArray(res)) setAlbumData(res);
        else if (res?.tracks) setAlbumData(res.tracks);
        else setAlbumData([]);
      })
      .catch(() => setAlbumData([]));
  }, [albumName]);

  useEffect(() => {
    if (!albumData?.length) return;
    const firstTrackId = albumData[0].id;
    ApiService.get(`/albums/image/${firstTrackId}`, {}, "RESOURCE")
      .then((res) => {
        if (typeof res === "string") setAlbumArt(`data:image/jpeg;base64,${res}`);
        else if (res?.image) setAlbumArt(`data:image/jpeg;base64,${res.image}`);
      })
      .catch(() => setAlbumArt("/default_album.png"));
  }, [albumData]);

  const playlist = useMemo(() => {
    if (!Array.isArray(albumData)) return [];
    return albumData.map((t) => ({
      id: t.id,
      title: t.album_movie_show_title || t.title || `Track ${t.id}`,
      artist: t.artist || t.singer || "",
      playlistUrl: `http://localhost:8082/playlist/${t.id}?lossless=false&hlsTime=1`,
      cover: t.cover || `data:image/jpeg;base64,${t.attachedPicture || ""}` || albumArt,
      __raw: t,
    }));
  }, [albumData, albumArt]);

const handlePlay = (index) => {
  console.log("🎯 handlePlay triggered! Index:", index);
  console.log("Playlist:", playlist);
  playTrackList(playlist, index);
};

  return (
    <div className="p-6 pb-32">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={albumArt}
          alt={albumName}
          className="w-32 h-32 rounded-lg object-cover shadow-md"
        />
        <div>
          <h2 className="text-2xl font-bold text-blue-600">{albumName}</h2>
          <p className="text-gray-500">{albumData.length} tracks</p>
        </div>
      </div>

      {albumData.length === 0 ? (
        <p className="text-center text-gray-500">Loading album details...</p>
      ) : (
        <ul className="divide-y divide-gray-300">
          {albumData.map((t, index) => (
            <li
              key={t.id}
              className={`p-2 cursor-pointer transition-colors ${
                currentTrack?.id === String(t.id) || currentTrack?.id === t.id
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => handlePlay(index)}
            >
              🎵 {t.album_movie_show_title || t.title || `Track ${t.id}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
