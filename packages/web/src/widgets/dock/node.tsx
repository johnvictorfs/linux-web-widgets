import { useMemo } from "preact/hooks";
import { sendMessage } from "~/lib/widget";
import type { I3Node } from "./workspaces";

const hasFocusedNode = (node: I3Node): boolean => {
  if (node.focused) {
    return true;
  }

  if (node.nodes) {
    for (const innerNode of node.nodes) {
      if (hasFocusedNode(innerNode)) {
        return true;
      }
    }
  }

  return false;
};

export const WindowNode = (props: { node: I3Node }) => {
  if (props.node.name?.includes("dock")) {
    return null;
  }

  const isFocusedOrHasFocusedChildren = useMemo(() => {
    return hasFocusedNode(props.node);
  }, [props.node.focused, props.node.nodes]);

  const moveToWorkspace = (workspace: string | null) => {
    if (!workspace) {
      return;
    }

    sendMessage("command", {
      command: "i3-msg",
      args: [`workspace ${workspace}`],
    });
  };

  if (props.node.type === "workspace" && props.node.num) {
    return (
      <div
        className={`flex items-center justify-center transition-all
      ${
        isFocusedOrHasFocusedChildren
          ? "bg-slate-600 text-secondary-foreground/60"
          : "bg-secondary text-secondary-foreground"
      }
      rounded-lg w-12 h-8 cursor-pointer`}
        onClick={() => moveToWorkspace(props.node.name)}
      >
        <span className="text-sm text-center">
          {props.node.name ?? props.node.num}
        </span>
      </div>
    );
  }

  if (props.node.type === "con" && props.node.window_properties) {
    return (
      <div className="p-2 m-2 rounded-md bg-slate-500 text-white">
        {props.node.window_properties?.instance ?? props.node.name}
      </div>
    );
  }

  return (
    <>
      {props.node.nodes?.map((node) => (
        <WindowNode key={node.id} node={node} />
      )) ?? null}
    </>
  );
};
