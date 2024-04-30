import { useListenedValue } from "~/lib/hooks";
import { sendMessage } from "~/lib/widget";
import { Applet } from "./applet";
import { MicrophoneIcon } from "./icons/microphone";
import { MicrophoneMutedIcon } from "./icons/microphone-muted";

export const Microphone = () => {
  const { value: micMuted, setValue: setMicStatus } = useListenedValue<boolean>(
    {
      command: "pamixer",
      args: ["--default-source", "--get-mute"],
      defaultValue: false,
      formatValue(value) {
        return value.includes("true");
      },
      pollingInterval: 5_000,
      type: "polling",
    }
  );

  const toggleMic = () => {
    setMicStatus((muted) => !muted);
    sendMessage("command", {
      command: "pamixer",
      args: ["--default-source", "-t"],
    });
  };

  const openPulseAudio = () => {
    sendMessage("command", {
      command: "pavucontrol",
      args: [],
    });
  };

  return (
    <Applet
      className={`gap-2 cursor-pointer ${micMuted ? "text-red-400" : ""}`}
      onClick={(event) => {
        if (event.button === 1) {
          // middle-click
          openPulseAudio();
        } else {
          toggleMic();
        }
      }}
    >
      {micMuted ? (
        <MicrophoneMutedIcon className="h-4 w-4" />
      ) : (
        <MicrophoneIcon className="h-4 w-4" />
      )}
    </Applet>
  );
};
