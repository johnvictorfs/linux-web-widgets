import { useMemo } from "preact/hooks";
import type { I3Node } from ".";

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

  if (props.node.type === "workspace" && props.node.num) {
    return (
      <div
        className={`flex items-center justify-center
      ${isFocusedOrHasFocusedChildren ? "bg-slate-400" : "bg-slate-700"}
      rounded-lg w-12 h-8 text-gray-100`}
      >
        <span className="text-sm font-bold">{props.node.num}</span>
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
