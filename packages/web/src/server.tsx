import fs from "fs";

import preact from "@preact/preset-vite";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { html } from "hono/html";
import path from "path";
import { build as viteBuild } from "vite";

export const Layout = (props: { title: string; path: string }) => {
  return html`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${props.title}</title>
      </head>

      <body>
        <div id="root"></div>
        <script type="module" src="${props.path}"></script>
      </body>
    </html>`;
};

const app = new Hono();

const widgets = ["dock.tsx", "thing.tsx"];

const buildWidgets = async () => {
  const buildFolder = path.resolve(`./src/dist`);

  if (fs.existsSync(buildFolder)) {
    fs.rmdirSync(buildFolder, { recursive: true });
  }

  for (const widget of widgets) {
    const html = Layout({ title: "Dock", path: `./${widget}` }).toString();

    fs.mkdirSync(buildFolder, { recursive: true });

    fs.writeFileSync(
      path.resolve(`${buildFolder}/index.html`),
      html.toString()
    );

    fs.copyFileSync(
      path.resolve(`./src/widgets/${widget}`),
      path.resolve(`${buildFolder}/${widget}`)
    );

    await viteBuild({
      root: buildFolder,
      build: {
        emptyOutDir: false,
        outDir: path.join(buildFolder, "dist"),
      },
      plugins: [preact()],
      resolve: {
        alias: {
          "~": "../",
        },
      },
    });

    fs.renameSync(
      path.resolve(`${buildFolder}/dist/index.html`),
      path.resolve(`${buildFolder}/dist/${widget.replace(".tsx", ".html")}`)
    );
  }
};

const port = parseInt(process.env.PORT!) || 3000;
await buildWidgets();

widgets.forEach((widget) => {
  const widgetsPath = `./src/build/${widget}/dist`;
  console.log(`serving ${widgetsPath}`);
  // app.use(`/widget/${widget}/*`, serveStatic({ root: "./" }));
});

app.get(
  `/*`,
  serveStatic({
    root: `./src/dist/dist/`,
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`);
    },
  })
);

console.log(`Running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
