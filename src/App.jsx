// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AudioPlayer from "./components/audio_player/AudioPlayer";
import VideoPlayer from "./components/video_player/VideoPlayer";
import { AudioPlayerProvider } from "./components/audio_player/context/AudioPlayerContext";
import AlbumDetails from "./components/audio_player/components/AlbumDetails";
import PlayerBar from "./components/audio_player/PlayerBar";

export default function App() {
  return (
    <Router>
      <AudioPlayerProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/audio-player" replace />} />
              <Route path="/audio-player" element={<AudioPlayer />} />
              <Route
                path="/audio-player/albums/:albumName"
                element={<AlbumDetails />}
              />
              <Route path="/video-player" element={<VideoPlayer />} />
              <Route
                path="*"
                element={
                  <h2 className="p-6 text-center text-red-500">
                    404 — The tune you’re looking for doesn’t exist.
                  </h2>
                }
              />
            </Routes>
          </div>

          {/* Persistent bottom player */}
          <PlayerBar />
        </div>
      </AudioPlayerProvider>
    </Router>
  );
}
