/** @type {import('next').NextConfig} */
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd()),
  adapterPath: require.resolve("./yc-adapter.config.mjs"),
};

export default nextConfig;