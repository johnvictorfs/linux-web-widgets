import { render, type VNode } from "preact";

export type WindowType = "dialog" | "dock";

class Widget {
  private _width: number = 100;
  private _height: number = 100;
  private _windowType: WindowType = "dock";
  private _display?: string;
  private _position?: { x: number; y: number };

  private render: () => VNode;

  constructor(render: () => VNode) {
    this.render = render;
  }

  position(x: number, y: number) {
    this._position = { x, y };
    return this;
  }

  width(value: number) {
    this._width = value;
    return this;
  }

  height(value: number) {
    this._height = value;
    return this;
  }

  windowType(value: WindowType) {
    this._windowType = value;
    return this;
  }

  /**
   * @param value Display name to render the window at
   * @example "HDMI-1"
   */
  display(value: string) {
    this._display = value;
    return this;
  }

  build() {
    render(<this.render />, document.getElementById("root")!);

    sendMessage("setup-window", {
      width: this._width,
      height: this._height,
      window_type: this._windowType,
      display: this._display,
      x: this._position?.x,
      y: this._position?.y,
    });
  }
}

export const widgetBuilder = (render: () => VNode) => {
  return new Widget(render);
};

declare global {
  interface Window {
    ipc: {
      postMessage: (message: string) => void;
    };
  }
}

type MessagePayloads = {
  "setup-window": {
    width: number;
    height: number;
    window_type: WindowType;
    display?: string;
    x?: number;
    y?: number;
  };
};

export const sendMessage = <T extends keyof MessagePayloads>(
  message: T,
  data: MessagePayloads[T]
) => {
  window.ipc.postMessage(`${message}:${JSON.stringify(data)}`);
};
