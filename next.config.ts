import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Prefer this app folder when other lockfiles exist higher in the tree (e.g. home directory).
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    // Fewer process spawns than the default; usually faster dev compiles, especially on Windows.
    turbopackPluginRuntimeStrategy: "workerThreads",
    // Caches work between `next build` runs (faster repeat builds; default is off for build).
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;
