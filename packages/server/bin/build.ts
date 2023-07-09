import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/server.ts"],
  bundle: true,
  outdir: "dist",
  platform: "node",
  target: "node18",
  format: "esm",
});
