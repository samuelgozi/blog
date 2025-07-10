import { nanoid } from "@mod/std/nanoid";
import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";

export const id = text().primaryKey().$default(nanoid);

export const timestamps = {
	updatedAt: text().$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
	createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
	deletedAt: text()
}
