import { z } from "zod";

import { useEffect } from "preact/hooks";
import { useListenedValue } from "~/lib/hooks";
import { sendMessage } from "~/lib/widget";
import { WindowNode } from "./workspace";

const workspaceSchema = z.object({
  id: z.number(),
  num: z.number(),
  name: z.string(),
  visible: z.boolean(),
  focused: z.boolean(),
  rect: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  output: z.string(),
  urgent: z.boolean(),
});

export type Workspace = z.infer<typeof workspaceSchema>;

export const Workspaces = (props: { display: string }) => {
  const { value: workspaces, setValue: setWorkspaces } = useListenedValue<
    Workspace[] | null
  >({
    command: "sh",
    args: [
      "-c",
      `i3-msg -t subscribe -m '[ "window" ]' | while read line ; do echo $(i3-msg -t get_workspaces); done`,
    ],
    type: "listener",
    defaultValue: null,
    formatValue(data) {
      return JSON.parse(data);
    },
  });

  useEffect(() => {
    sendMessage("command", {
      command: "i3-msg",
      args: ["-t", "get_workspaces"],
      callback(data) {
        const parsed: Workspace[] = JSON.parse(data);
        setWorkspaces(parsed);
      },
    });
  }, []);

  return (
    <div className="flex flex-row gap-2">
      {workspaces?.map((workspace) => {
        if (workspace.output === props.display) {
          return <WindowNode workspace={workspace} key={workspace.id} />;
        }

        return null;
      })}
    </div>
  );
};
