import type { ComponentChildren } from "preact";
import type { HTMLAttributes } from "preact/compat";

export const Applet = ({
  children,
  className,
  ...props
}: { children: ComponentChildren } & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex items-center gap-2 justify-center rounded-lg p-1 transition-colors hover:bg-slate-600 ${
      className ?? ""
    }`}
    {...props}
  >
    {children}
  </div>
);
