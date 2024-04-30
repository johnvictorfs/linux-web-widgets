import { useListenedValue } from "~/lib/hooks";
import { sendMessage } from "~/lib/widget";
import { Applet } from "./applet";
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
    pollingInterval: 5_000,
    type: "polling",
  });

  const { value: isMuted, setValue: setMuted } = useListenedValue<boolean>({
    command: "pamixer",
    args: ["--get-mute"],
    defaultValue: false,
    formatValue(value) {
      return value === "true";
    },
    pollingInterval: 5_000,
    type: "polling",
  });

  const openPulseAudio = () => {
    sendMessage("command", {
      command: "pavucontrol",
      args: [],
    });
  };

  const noVolume = isMuted || volume === 0;

  const toggleVolume = () => {
    setMuted(!isMuted);
    sendMessage("command", {
      command: "pamixer",
      args: ["--toggle-mute"],
    });
  };

  return (
    <Applet
      className={`gap-2 cursor-pointer ${noVolume ? "text-red-400" : ""}`}
      onWheel={(event) => {
        if (event.deltaY < 0) {
          sendMessage("command", {
            command: "pamixer",
            args: ["--increase", "5"],
          });

          setVolume((volume) => Math.min(volume + 5, 100));
        } else {
          sendMessage("command", {
            command: "pamixer",
            args: ["--decrease", "5"],
          });
          setVolume((volume) => Math.max(volume - 5, 0));
        }
      }}
      onClick={(event) => {
        if (event.button === 1) {
          // middle-click
          openPulseAudio();
        } else {
          toggleVolume();
        }
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
    </Applet>
  );
};
