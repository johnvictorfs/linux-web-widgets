import { sendMessage } from "~/lib/widget";
import type { Workspace } from "./workspaces";

export const WindowNode = (props: { workspace: Workspace }) => {
  const moveToWorkspace = (workspace: string | null) => {
    if (!workspace) {
      return;
    }

    sendMessage("command", {
      command: "i3-msg",
      args: [`workspace ${workspace}`],
    });
  };

  return (
    <div
      className={`flex items-center justify-center transition-all border border-secondary
    ${
      props.workspace.focused
        ? "text-secondary-foreground/60 border--secondary/60"
        : "bg-secondary text-secondary-foreground"
    }
    rounded-lg w-14 h-9 cursor-pointer text-lg`}
      onClick={() => moveToWorkspace(props.workspace.name)}
    >
      {props.workspace.name ?? props.workspace.num}
    </div>
  );
};
