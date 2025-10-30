import React, { useEffect, useState } from "react";
import ApiService from "../../common/ApiService";
import GenericCarousel from "../../common/GenericCarousel";
import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "../context/AudioPlayerContext";
export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const navigate = useNavigate();
  const { playTrack } = useAudioPlayer();

  useEffect(() => {
    ApiService.get("/albums", {}, "RESOURCE")
      .then(setAlbums)
      .catch(console.error);
  }, []);

  const handleAlbumClick = (album) => {
    navigate(`/audio-player/albums/${album.album}`);
  };

  const renderAlbum = (album) => (
    <div
      onClick={() => handleAlbumClick(album)}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 group cursor-pointer"
    >
      <img
        src={`data:image/jpeg;base64,${album.attachedPicture}`}
        alt={album.album}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <p className="mt-3 text-center text-sm font-medium text-slate-700 dark:text-gray-200 group-hover:text-yellow-400 transition">
        {album.album || "Untitled Album"}
      </p>
    </div>
  );

  return (
    <GenericCarousel
      title="🎶 Albums"
      items={albums}
      renderItem={renderAlbum}
      settings={{ slidesToShow: 8, slidesToScroll: 2 }}
    />
  );
}
