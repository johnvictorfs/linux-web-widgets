import { useListenedValue } from "~/lib/hooks";
import { sendMessage } from "~/lib/widget";
import { Applet } from "./applet";
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
    <Applet
      data-status={bluetoothStatus}
      className="text-muted-foreground data-[status=on]:text-sky-500 cursor-pointer"
      onClick={(event) => {
        if (event.button === 1) {
          sendMessage("command", {
            command: "blueman-manager",
            args: [],
          });
        } else {
          toggleBluetooth();
        }
      }}
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
    </Applet>
  );
};
