import { useListenedValue } from "~/lib/hooks";

export const Media = () => {
  const { value: playingStatus } = useListenedValue<"Playing" | "Paused">({
    command: "playerctl",
    args: ["--follow", "status"],
    defaultValue: "Paused",
  });

  return <div>{playingStatus}</div>;
};
