import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../common/ApiService";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import API_BASE_URL from "../../../config";

export default function GenericHolder() {
  const { columnName, filterValue } = useParams();
  const [tracks, setTracks] = useState([]);
  const [coverImage, setCoverImage] = useState("/default_album.png");
  const { playTrackList, currentTrack, trackImage, setTrackImage } = useAudioPlayer();

  /** 🎧 Fetch tracks for this filter */
  useEffect(() => {
    if (!columnName || !filterValue) return;
    ApiService.get(`/column/${columnName}/${filterValue}`, {}, "RESOURCE")
      .then((res) => {
        if (Array.isArray(res)) setTracks(res);
        else if (res?.tracks) setTracks(res.tracks);
        else setTracks([]);
      })
      .catch(() => setTracks([]));
  }, [columnName, filterValue]);

  /** 🖼️ Fetch an image from first track (for banner display) */
  useEffect(() => {
    if (!tracks?.length) return;
    const firstTrackId = tracks[0].id;
    ApiService.get(`/albums/image/${firstTrackId}`, {}, "RESOURCE")
      .then((res) => {
        if (typeof res === "string") {
          setCoverImage(`data:image/jpeg;base64,${res}`);
          setTrackImage(`data:image/jpeg;base64,${res}`);
        } else if (res?.image) {
          setCoverImage(`data:image/jpeg;base64,${res.image}`);
          setTrackImage(`data:image/jpeg;base64,${res.image}`);
        }
      })
      .catch(() => setCoverImage("/default_album.png"));
  }, [tracks]);

  /** 🎵 Prepare playlist */
  const playlist = useMemo(() => {
    if (!Array.isArray(tracks)) return [];
    return tracks.map((t) => ({
      id: t.id,
      title: t.album_movie_show_title || t.title || `Track ${t.id}`,
      artist: t.artist || t.singer || "",
      playlistUrl: `${API_BASE_URL.RESOURCE_URL}/playlist/${t.id}?lossless=true&hlsTime=1`,
      cover: t.cover || `data:image/jpeg;base64,${t.attachedPicture || ""}` || coverImage,
      __raw: t,
    }));
  }, [tracks, coverImage]);

  /** ▶️ Handle track click */
  const handlePlay = (index) => {
    console.log(`🎯 Playing from ${columnName}: ${filterValue} (index ${index})`);
    playTrackList(playlist, index);
  };

  return (
    <div className="p-6 pb-32">
      {/* 🧠 Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={coverImage}
          alt={filterValue}
          className="w-32 h-32 rounded-lg object-cover shadow-md"
        />
        <div>
          <h2 className="text-2xl font-bold text-blue-600 capitalize">
            {filterValue}
          </h2>
          <p className="text-gray-500">{tracks.length} tracks found by {columnName}</p>
        </div>
      </div>

      {/* 🎶 Track List */}
      {tracks.length === 0 ? (
        <p className="text-center text-gray-500">Loading tracks...</p>
      ) : (
        <ul className="divide-y divide-gray-300">
          {tracks.map((t, index) => (
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
              {t.artist ? (
                <span className="text-sm text-gray-500 ml-2">– {t.artist}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
