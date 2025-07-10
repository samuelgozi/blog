import { defineConfig } from "drizzle-kit";
import { env } from "./services/env";

export default defineConfig({
	out: "./drizzle",
	schema: "./schema",
	dialect: "sqlite",
	dbCredentials: {
		url: env.DB_FILE_NAME!,
	},
});
