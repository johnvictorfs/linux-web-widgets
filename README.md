# linux-web-widgets

<div align="center" style="margin-bottom: 20px;">
  <strong>Status:</strong> Proof of concept
</div>

Ever wanted to build your window manager dock using React.js and tailwindcss? No? Well, here we are. Do I recommend it? Nope, but it's pretty fun.

Built with [`tao`](https://github.com/tauri-apps/tao) and [`wry`](https://github.com/tauri-apps/wry) from [Tauri](https://tauri.app).

![image](https://github.com/johnvictorfs/dotfiles/assets/37747572/af448e31-ed51-4f12-819a-75e93fa7ac67)

## Development

- Requirements

  - [bun](https://bun.sh)
  - [rust](https://www.rust-lang.org/tools/install)

- Install dependencies

  - `bun install`

- Running

  - `bun dev`

- Add/update widgets

  - Create new `{widgetName}/index.tsx` at `packages/web/src/widgets`
  - Create your widget:

    ```tsx
    // See examples of a widget at `packages/web/src/widgets/dock/index.tsx`
    const MyComponent = () => {
      return <div>hello</div>;
    };

    // Warning: some properties like `display` don't do anything at the moment
    widgetBuilder(MyComponent)
      .position(20, 20)
      .width(1880)
      .height(60)
      .windowType("dock")
      .build();
    ```

  - Add your widget to the list of widgets at `packages/desktop/src/main.rs`

    ```rust
    const WIDGETS: [(&str, &str); 2] = [
      ("Dock", "http://localhost:3000/dock.html"),
      // Use same {widgetName} used for the folder created in the previous steps
      ("Your new widget", "http://localhost:3000/{widgetName}.html"),
    ];
    ```

## Known issues

- Half the time the initial window created by `tao` is invisible if the web server is not running when it starts
  - On another note, you need to manually refresh the webview in the window created by `tao` if it starts before the web server, ideally a web server to serve static files should not be needed and wry should just use them directly
- The webview still needs to be refreshed manually on every web server "hot-reload"
- Need to manually update list of widgets in Rust code to add new widgets
- No packaging
- No daemon to properly run/manage everything
- Creating new widgets is too coupled with the web server code, should be more separate while still having access to its APIs
- Frontend framework used should be agnostic instead of always builting with preact
