import type { NextConfig } from "next";
import path from "node:path";

import { parseClientEnvironment } from "./src/env/env.client.schema";
import { parseServerEnvironment } from "./src/env/env.server.schema";

parseServerEnvironment(process.env);
parseClientEnvironment(process.env);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(import.meta.dirname, "../.."),
  },
};

export default nextConfig;
