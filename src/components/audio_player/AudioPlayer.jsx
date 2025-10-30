// src/components/audio_player/AudioPlayer.jsx
import Albums from "./components/Albums";
import MenuBar from "./components/menu_bar/MenuBar";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";

export default function AudioPlayer() {
  return (
    <AudioPlayerProvider>
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
        {/* Top Menu */}
        <MenuBar />

        {/* Main Content */}
        <div className="flex-1">
          <Albums />
        </div>
      </div>
    </AudioPlayerProvider>
  );
}
