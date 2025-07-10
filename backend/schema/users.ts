import { sql } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./helpers";

export const users = sqliteTable(
	"users",
	{
		id,
		username: text().unique().notNull(),
		hash: text().notNull(),
		...timestamps,
	},
	(table) => [
		uniqueIndex("emailUniqueIndex").on(sql`lower(${table.username})`),
	],
);

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
