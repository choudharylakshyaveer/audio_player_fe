// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AudioPlayer from "./components/audio_player/AudioPlayer";
import VideoPlayer from "./components/video_player/VideoPlayer";
import { AudioPlayerProvider } from "./components/audio_player/context/AudioPlayerContext";
import AlbumDetails from "./components/audio_player/components/AlbumDetails";
import PlayerBar from "./components/audio_player/PlayerBar";
import GenericHolder from "./components/audio_player/components/GenericHolder";
import { motion } from "framer-motion";
import { useAudioPlayer } from "./components/audio_player/context/AudioPlayerContext";

export default function App() {
  return (
    <Router>
      <AudioPlayerProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 relative">
          <div className="flex-1 relative">
            <Routes>
              <Route path="/" element={<Navigate to="/audio-player" replace />} />
              <Route path="/audio-player" element={<AudioPlayer />} />
              <Route
                path="/audio-player/albums/:albumName"
                element={<AlbumDetails />}
              />
              <Route
                path="/audio-player/generalList"
                element={<GenericHolder />}
              />
              <Route path="/video-player" element={<VideoPlayer />} />
              <Route
                path="*"
                element={<h2 className="p-6 text-center text-red-500">
                  404 — The tune you’re looking for doesn’t exist.
                </h2>}
              />
            </Routes>

            {/* bottom spacing to prevent overlap */}
            <PageBottomSpacer />
          </div>

          <FloatingPlayerBar />
        </div>
      </AudioPlayerProvider>
    </Router>
  );
}

function PageBottomSpacer() {
  const { expanded } = useAudioPlayer();
  return <div className={expanded ? "h-[300px]" : "h-[80px]"} />;
}

/* Floating animated player bar */
function FloatingPlayerBar() {
  const { expanded } = useAudioPlayer();

  return (
    <motion.div
  initial={{ y: 120, opacity: 0 }}
  animate={{
    y: 0,
    opacity: 1,
    height: expanded ? 300 : 140, // enough to show play button
  }}
  transition={{ type: "spring", stiffness: 110, damping: 18 }}
  className="fixed bottom-0 left-0 right-0 z-50
    bg-slate-900/70 backdrop-blur-lg backdrop-saturate-150
    rounded-t-3xl shadow-[0_0_40px_rgba(0,0,0,0.7)]
    border-t border-white/10
  "
>
  <PlayerBar />
</motion.div>
  );
}
