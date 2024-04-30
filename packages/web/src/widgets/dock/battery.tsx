import { useListenedValue } from "~/lib/hooks";
import { Applet } from "./applet";
import { BatteryChargingIcon } from "./icons/battery-charging";
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
      return parseInt(value, 10);
    },
    pollingInterval: interval,
    type: "polling",
  });

  const { value: batteryStatus } = useListenedValue<
    "Unknown" | "Charging" | "Discharging"
  >({
    command: "cat",
    args: [`/sys/class/power_supply/${batteryName}/status`],
    defaultValue: "Unknown",
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
    <Applet
      className={`gap-1 ${batteryColor} ${
        batteryLevel < 20 ? "animate-pulse" : ""
      }`}
    >
      {batteryLevel < 100 && batteryStatus === "Charging" ? (
        <BatteryChargingIcon />
      ) : (
        batteryIcon
      )}
      {batteryLevel}%
    </Applet>
  );
};
