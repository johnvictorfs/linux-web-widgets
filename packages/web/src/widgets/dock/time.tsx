import { useEffect, useState } from "preact/hooks";
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
    <div className="flex flex-row gap-2 items-center justify-center">
      <ClockIcon className="h-4 w-4 mb-1" /> {timeStr} |{" "}
      <CalendarIcon className="h-4 w-4 mb-1" /> {dateStr}
    </div>
  );
};
