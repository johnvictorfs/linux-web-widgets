import { widgetBuilder } from "~/lib/widget";

import "~/styles.css";
import { Battery } from "./battery";
import { Media } from "./media";
import { Time } from "./time";
import { Workspaces } from "./workspaces";

const Dock = (props: { display: string }) => {
  return (
    <div className="flex gap-2 px-2 items-center w-full h-[100vh] justify-between">
      <div className="flex grow-1 w-full gap-2 items-center">
        <Workspaces display={props.display} />

        <Media />
      </div>

      <div className="flex grow-0 w-full items-center justify-center">
        <Time />
      </div>

      <div className="flex grow-1 w-full gap-2 items-center justify-end">
        <Battery batteryName="BAT1" interval={10_000} />
      </div>
    </div>
  );
};

widgetBuilder(() => <Dock display="HDMI-0" />)
  .position(20, 20)
  .width(1880)
  .height(60)
  .windowType("dock")
  .build();
