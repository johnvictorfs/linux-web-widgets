import { useListenedValue } from "~/lib/hooks";
import { sendMessage } from "~/lib/widget";
import { BluetoothIcon } from "./icons/bluetooth";
import { BluetoothConnectedIcon } from "./icons/bluetooth-connected";
import { BluetoothOffIcon } from "./icons/bluetooth-off";

export const Bluetooth = () => {
  const { value: bluetoothStatus, setValue: setBluetoothStatus } =
    useListenedValue<"on" | "off">({
      command: "bluetoothctl",
      args: ["show"],
      defaultValue: "off",
      formatValue(value) {
        console.log("bluetooth", value, value.includes("Powered: yes"));
        return value.includes("Powered: yes") ? "on" : "off";
      },
      pollingInterval: 5000,
      type: "polling",
    });

  const { value: connectedDevices } = useListenedValue({
    command: "bluetoothctl",
    args: ["devices", "Connected"],
    defaultValue: "",
    pollingInterval: 5000,
    type: "polling",
  });

  const toggleBluetooth = () => {
    setBluetoothStatus(bluetoothStatus === "on" ? "off" : "on");
    sendMessage("command", {
      command: "bluetoothctl",
      args: ["power", bluetoothStatus === "on" ? "off" : "on"],
    });
  };

  return (
    <div
      data-status={bluetoothStatus}
      className="flex gap-2 items-center justify-center text-muted-foreground data-[status=on]:text-sky-500 cursor-pointer"
      onClick={toggleBluetooth}
    >
      {bluetoothStatus === "on" ? (
        !!connectedDevices ? (
          <BluetoothConnectedIcon className="w-4 h-4" />
        ) : (
          <BluetoothIcon className="w-4 h-4" />
        )
      ) : (
        <BluetoothOffIcon className="w-4 h-4" />
      )}
    </div>
  );
};
