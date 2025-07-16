import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./helpers";

export const media = sqliteTable("media", {
	id,
	originalName: text().notNull(),
	originalType: text().notNull(),
	...timestamps,
});

export type SelectMedia = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;
