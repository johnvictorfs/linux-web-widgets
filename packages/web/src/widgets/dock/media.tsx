import { useListenedValue } from "~/lib/hooks";
import { sendMessage } from "~/lib/widget";
import { CirclePauseIcon } from "./icons/circle-pause";
import { CirclePlayIcon } from "./icons/circle-play";

const NO_SONG_PLAYING = "No song playing";

export const Media = () => {
  const { value: playingStatus } = useListenedValue<"Playing" | "Paused">({
    command: "playerctl",
    args: ["--follow", "status"],
    defaultValue: "Paused",
  });

  const { value: songTitle } = useListenedValue<string>({
    command: "playerctl",
    args: ["--follow", "metadata", "--format", "{{ artist }} - {{ title }}"],
    defaultValue: NO_SONG_PLAYING,
  });

  const togglePlayPause = () => {
    sendMessage("command", {
      command: "playerctl",
      args: ["play-pause"],
    });
  };

  if (!songTitle || !songTitle || songTitle === NO_SONG_PLAYING) {
    return null;
  }

  const color = playingStatus === "Playing" ? "text-green-500" : "";

  return (
    <div
      className={`flex flex-row gap-1 items-center max-w-96 p-2 bg-gray-800 rounded-lg cursor-pointer ${color}`}
      onClick={togglePlayPause}
    >
      {playingStatus === "Playing" ? (
        <CirclePauseIcon className="w-5 h-5" />
      ) : (
        <CirclePlayIcon className="w-5 h-5" />
      )}
      <span className="text-sm truncate">{songTitle}</span>
    </div>
  );
};
