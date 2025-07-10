import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { env } from "./services/env";

const client = new Database(env.DB_FILE_NAME);
export const db = drizzle({ client });
