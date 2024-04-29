import { useEffect, useState } from "preact/hooks";
import { sendMessage } from "./widget";

export function useListenedValue<T = string>({
  defaultValue,
  command,
  args,
  formatValue,
  type = "listener",
  pollingInterval = 1_000,
}: {
  defaultValue?: T | (() => T) | null;
  formatValue?: (data: string) => T;
  command: string;
  args: string[];
  /** @default 'listener' */
  type?: "listener" | "polling";
  /** @default 1_000 */
  pollingInterval?: number;
}) {
  const [value, setValue] = useState<T>(defaultValue as T);

  const sendCommand = () => {
    console.log(`sending command ${command} with args ${args}`);
    const { cleanUp, commandId } = sendMessage("command", {
      command,
      args,
      listen: type === "listener",
      callback(data) {
        if (formatValue) {
          setValue(formatValue(data));
          return;
        }

        setValue(data as T);
      },
    });

    console.log(`command ${commandId} (${command})`);

    return cleanUp;
  };

  useEffect(() => {
    if (type === "polling") {
      sendCommand();
      const interval = setInterval(sendCommand, pollingInterval);

      return () => {
        clearInterval(interval);
      };
    }

    return sendCommand();
  }, []);

  return {
    value,
    setValue,
  };
}
