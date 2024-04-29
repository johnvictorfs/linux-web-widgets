import { widgetBuilder } from "~/lib/widget";

import "~/styles.css";
import { Battery } from "./battery";
import { Media } from "./media";
import { Time } from "./time";
import { Volume } from "./volume";
import { Workspaces } from "./workspaces";

const Dock = (props: { display: string }) => {
  return (
    <div className="flex gap-2 px-2 items-center w-full h-[100vh] justify-between bg-background">
      <div className="flex grow-1 w-full gap-2 items-center">
        <Workspaces display={props.display} />

        <Media />
      </div>

      <div className="flex grow-0 w-full items-center justify-center">
        <Time />
      </div>

      <div className="flex w-full items-center justify-end">
        <div className="flex gap-4 bg-secondary rounded-md px-2 py-1">
          <Volume />

          <Battery batteryName="BAT1" interval={10_000} />
        </div>
      </div>
    </div>
  );
};

widgetBuilder(() => <Dock display="HDMI-0" />)
  .position(0, 0)
  .width(1920)
  .height(60)
  .windowType("dock")
  .build();
