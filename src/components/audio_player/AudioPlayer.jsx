// AudioPlayer.jsx
import Albums from "./components/Home";
import MenuBar from "./components/menu_bar/MenuBar";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import PlayerBar from "./PlayerBar";

export default function AudioPlayer() {
  return (
    <AudioPlayerProvider>
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
        <MenuBar />
        <div className="flex-1">
          <Albums />
        </div>
        <PlayerBar />
      </div>
    </AudioPlayerProvider>
  );
}
