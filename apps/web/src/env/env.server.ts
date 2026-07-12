import "server-only";

import { parseServerEnvironment } from "./env.server.schema";

export const serverEnvironment = parseServerEnvironment(process.env);
