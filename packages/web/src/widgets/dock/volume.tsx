import { useListenedValue } from "~/lib/hooks";
import { sendMessage } from "~/lib/widget";
import { VolumeFullIcon } from "./icons/volume-full";
import { VolumeLowIcon } from "./icons/volume-low";
import { VolumeMutedIcon } from "./icons/volume-muted";

export const Volume = () => {
  const { value: volume, setValue: setVolume } = useListenedValue<number>({
    command: "pamixer",
    args: ["--get-volume"],
    defaultValue: 0,
    formatValue(value) {
      return parseInt(value, 10);
    },
    pollingInterval: 1_000,
    type: "polling",
  });

  const { value: isMuted, setValue: setMuted } = useListenedValue<boolean>({
    command: "pamixer",
    args: ["--get-mute"],
    defaultValue: false,
    formatValue(value) {
      return value === "true";
    },
    pollingInterval: 1_000,
    type: "polling",
  });

  const noVolume = isMuted || volume === 0;

  return (
    <div
      className={`flex flex-row gap-2 items-center cursor-pointer ${
        noVolume ? "text-red-400" : ""
      }`}
      onWheel={(event) => {
        if (event.deltaY < 0) {
          sendMessage("command", {
            command: "pamixer",
            args: ["--increase", "5"],
          });
          setVolume((volume) => (volume + 5 > 100 ? 100 : volume + 5));
        } else {
          sendMessage("command", {
            command: "pamixer",
            args: ["--decrease", "5"],
          });
          setVolume((volume) => (volume - 5 < 0 ? 0 : volume - 5));
        }
      }}
      onClick={() => {
        setMuted(!isMuted);
        sendMessage("command", {
          command: "pamixer",
          args: ["--toggle-mute"],
        });
      }}
    >
      {noVolume ? (
        <VolumeMutedIcon className="w-4 h-4" />
      ) : volume > 60 ? (
        <VolumeFullIcon className="w-4 h-4" />
      ) : (
        <VolumeLowIcon className="w-4 h-4" />
      )}
      {volume}%
    </div>
  );
};
