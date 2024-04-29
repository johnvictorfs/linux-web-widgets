import { useListenedValue } from "~/lib/hooks";
import { BatteryFullIcon } from "./icons/battery-full";
import { BatteryLowIcon } from "./icons/battery-low";
import { BatteryMediumIcon } from "./icons/battery-medium";
import { BatteryWarningIcon } from "./icons/battery-warning";

export const Battery = ({
  batteryName = "BAT1",
  interval = 10_000,
}: {
  /** @default 'BAT1' */
  batteryName?: string;
  /** @default 10_000 */
  interval?: number;
}) => {
  const { value: batteryLevel } = useListenedValue({
    command: "cat",
    args: [`/sys/class/power_supply/${batteryName}/capacity`],
    defaultValue: 0,
    formatValue(value) {
      console.log("value", value);
      return parseInt(value, 10);
    },
    pollingInterval: interval,
    type: "polling",
  });

  const batteryIcon =
    batteryLevel < 20 ? (
      <BatteryWarningIcon />
    ) : batteryLevel < 50 ? (
      <BatteryLowIcon />
    ) : batteryLevel < 80 ? (
      <BatteryMediumIcon />
    ) : (
      <BatteryFullIcon />
    );

  const batteryColor =
    batteryLevel < 50
      ? "text-amber-500"
      : batteryLevel < 20
      ? "text-red-500"
      : "";

  return (
    <div className={`flex flex-row gap-1 items-center ${batteryColor}`}>
      <span className="mb-1 -rotate-90">{batteryIcon}</span>
      {batteryLevel}%
    </div>
  );
};
