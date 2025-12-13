import React, { useEffect, useState } from "react";
import ApiService from "../../common/ApiService";
import GenericCarousel from "../../common/GenericCarousel";
import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "../context/AudioPlayerContext";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const navigate = useNavigate();
  const { playTrack } = useAudioPlayer();

  useEffect(() => {
    ApiService.get("/albums", {}, "RESOURCE")
      .then(setAlbums)
      .catch(console.error);
    ApiService.get("/column/artists", {}, "RESOURCE")
      .then(setArtists)
      .catch(console.error);
    ApiService.get("/playlist", {}, "RESOURCE").then(setPlaylists);
  }, []);

  const handleAlbumClick = (album) => {
    // navigate(`/audio-player/albums/${album.album}`);
    navigate(`/audio-player/generalList?type=ALBUM&albumName=${encodeURIComponent(album.album)}`);

  };
  const handleElementClick = (columnName,filterValue ) => {
  navigate(`/audio-player/generalList?type=COLUMN&columnName=${columnName}&filterValue=${encodeURIComponent(filterValue)}`);

    // navigate(`/audio-player/generalList/${columnName}/${filterValue}`);
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
const renderElements = (artistName) => (
  <div
    onClick={() => handleElementClick("artists", artistName)}
    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 group cursor-pointer"
  >
    <p className="mt-3 text-center text-sm font-medium text-slate-700 dark:text-gray-200 group-hover:text-yellow-400 transition">
      {artistName || "Untitled Artist"}
    </p>
  </div>
);


  return (
    <>
      <GenericCarousel
        title="🎶 Albums"
        items={albums}
        renderItem={renderAlbum}
        settings={{ slidesToShow: 8, slidesToScroll: 2 }}
      />

      <GenericCarousel
        title="🎶 Artists"
        items={artists}
        renderItem={renderElements}
        settings={{ slidesToShow: 8, slidesToScroll: 2 }}

      />

      <GenericCarousel
        title="🎶 Playlists"
        items={playlists}
        renderItem={(pl) => (
          <div
            onClick={() => navigate(`/audio-player/generalList?type=PLAYLIST&playlistId=${pl.id}`)
}
            
            className="p-4 rounded-xl bg-yellow-100 dark:bg-slate-700 text-center"
          >
            <h3 className="font-bold text-lg">{pl.name}</h3>
            <p className="text-gray-500 text-sm">{pl.tracks?.length || 0} tracks</p>
          </div>
        )}
      />
    </>
  );
}
