import "server-only";

import { serverEnvironment } from "../../env/env.server";
import { createDatabase } from "./factory";

const globalDatabase = globalThis as typeof globalThis & {
  egogDatabase?: ReturnType<typeof createDatabase>;
};

const database =
  globalDatabase.egogDatabase ?? createDatabase(serverEnvironment.DATABASE_URL);

if (process.env.NODE_ENV !== "production") globalDatabase.egogDatabase = database;

export const { db, sql } = database;
