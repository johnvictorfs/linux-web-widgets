import { useEffect, useState } from "preact/hooks";
import { sendMessage } from "~/lib/widget";
import { CalendarIcon } from "./icons/calendar";
import { ClockIcon } from "./icons/clock";

export const Time = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex gap-2 items-center justify-center">
      <div className="bg-secondary rounded-lg flex gap-2 items-center justify-center py-1 px-2">
        <ClockIcon className="h-4 w-4" /> {timeStr}
      </div>

      <div
        className="bg-secondary rounded-lg flex gap-2 items-center justify-center py-1 px-2 cursor-pointer hover:bg-secondary/60 active:scale-90 transition-transform"
        onClick={() => {
          sendMessage("command", {
            command: "xdg-open",
            args: ["https://calendar.google.com"],
          });
        }}
      >
        <CalendarIcon className="h-4 w-4" /> {dateStr}
      </div>
    </div>
  );
};
