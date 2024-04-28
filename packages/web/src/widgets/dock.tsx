import { useEffect, useMemo, useState } from "preact/hooks";
import { z } from "zod";
import { sendMessage, widgetBuilder } from "~/lib/widget";

import "~/styles.css";

const RectSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  })
  .nullable();

const WindowPropertiesSchema = z
  .object({
    class: z.string(),
    instance: z.string(),
    title: z.string(),
  })
  .optional()
  .nullable();

type I3Node = {
  id: number;
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  name: string | null;
  layout: string | null;
  nodes?: I3Node[] | null;
  window_properties?: {
    class: string;
    instance: string;
    title: string;
  } | null;
  type: "root" | "output" | "con" | "dockarea" | "workspace";
  num?: number | null;
  focused?: boolean | null;
  urgent?: boolean | null;
};

const NodeSchema: z.ZodSchema<I3Node> = z.object({
  id: z.number(),
  type: z.enum(["root", "output", "con", "dockarea", "workspace"]),
  rect: RectSchema.optional(),
  name: z.string().nullable(),
  layout: z.string().nullable(),
  nodes: z
    .array(z.lazy(() => NodeSchema))
    .optional()
    .nullable(),
  window_properties: WindowPropertiesSchema,
  num: z.number().optional().nullable(),
  focused: z.boolean().optional().nullable(),
  urgent: z.boolean().optional().nullable(),
});

const I3wmStructureSchema = z.object({
  rect: RectSchema,
  name: z.string(),
  layout: z.string(),
  nodes: z.array(NodeSchema),
});

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

const WindowNode = (props: { node: I3Node }) => {
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

const Dock = (props: { display: string }) => {
  const [nodes, setNodes] = useState<z.infer<
    typeof I3wmStructureSchema
  > | null>(null);

  useEffect(() => {
    // Get initial i3 tree state
    sendMessage("command", {
      command: "i3-msg",
      args: ["-t", "get_tree"],
      callback(data) {
        const parsed: z.infer<typeof I3wmStructureSchema> = JSON.parse(data);
        setNodes(parsed);
      },
    });

    // Listen for updates
    const { cleanUp } = sendMessage("command", {
      command: "sh",
      args: [
        // this feels stupid
        "-c",
        `i3-msg -t subscribe -m '[ "window" ]' | while read line ; do echo $(i3-msg -t get_tree); done`,
      ],
      listen: true,
      callback(data) {
        const parsed: z.infer<typeof I3wmStructureSchema> = JSON.parse(data);
        setNodes(parsed);
      },
    });

    return cleanUp;
  }, []);

  return (
    <div className="p-4 flex flex-row gap-2 items-center w-full h-full">
      {nodes?.nodes?.map((node) => {
        if (node.type === "output" && node.name === props.display) {
          return (
            <div key={node.id} className="flex flex-row gap-2">
              {node.nodes?.map((workspace) => (
                <WindowNode node={workspace} key={workspace.id} />
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

widgetBuilder(() => <Dock display="HDMI-0" />)
  .position(20, 20)
  .width(1880)
  .height(60)
  .windowType("dock")
  .build();
