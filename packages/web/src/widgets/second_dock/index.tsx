import { widgetBuilder } from "~/lib/widget";

import "~/styles.css";
import { Time } from "~/widgets/dock/time";
import { Workspaces } from "~/widgets/dock/workspaces";

const Dock = (props: { display: string }) => {
  return (
    <div className="flex gap-2 px-4 items-center w-full h-[100vh] justify-between bg-[#1b1b1f]">
      <div className="flex grow-1 w-full gap-2 items-center">
        <Workspaces display={props.display} />
      </div>

      <div className="flex grow-0 w-full items-center justify-center" />

      <div className="flex w-full items-center justify-end">
        <div className="flex gap-3 bg-secondary rounded-md px-2 py-1">
          <Time />
        </div>
      </div>
    </div>
  );
};

widgetBuilder(() => <Dock display="eDP-1-1" />)
  .position(1920, 0)
  .width(1920)
  .height(60)
  .windowType("dock")
  .build();
