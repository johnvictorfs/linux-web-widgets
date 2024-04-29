import { z } from "zod";

import { useEffect } from "preact/hooks";
import { useListenedValue } from "~/lib/hooks";
import { sendMessage } from "~/lib/widget";
import "~/styles.css";
import { WindowNode } from "./node";

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

export type I3Node = {
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

export const Workspaces = (props: { display: string }) => {
  const { value: nodes, setValue: setNodes } = useListenedValue<z.infer<
    typeof I3wmStructureSchema
  > | null>({
    command: "sh",
    args: [
      "-c",
      `i3-msg -t subscribe -m '[ "window" ]' | while read line ; do echo $(i3-msg -t get_tree); done`,
    ],
    type: "listener",
    defaultValue: null,
    formatValue(data) {
      return JSON.parse(data);
    },
  });

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
  }, []);

  return (
    <div>
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
