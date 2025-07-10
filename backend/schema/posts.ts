import {
	index,
	integer,
	sqliteTable,
	text,
	unique,
} from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./helpers";

export const posts = sqliteTable(
	"posts",
	{
		id,
		currentVersionId: text().notNull(),
		authorId: text().notNull(),
		publishedAt: text(),
		...timestamps,
	},
	(table) => [
		index("posts_author_idx").on(table.authorId),
		index("posts_published_idx").on(table.publishedAt),
		index("posts_deleted_idx").on(table.deletedAt),
		index("posts_current_version_idx").on(table.currentVersionId),
	],
);

export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export const postVersions = sqliteTable(
	"post_versions",
	{
		id,
		postId: text().notNull().references(() => posts.id, { onDelete: "cascade" }),
		version: integer().notNull(),
		status: text({enum: ["draft", "published", "scheduled"]}).notNull().default("draft"),
		title: text().notNull(),
		cover: text(),
		content: text(),
		changeNote: text(),
		createdBy: text().notNull(),
		createdAt: timestamps.createdAt,
	},
	(table) => [
		index("post_versions_post_version_idx").on(table.postId, table.version),
		index("post_versions_post_id_idx").on(table.postId),
		index("post_versions_status_idx").on(table.status),
		unique("post_version_unique").on(table.postId, table.version),
	],
);

export type SelectPostVersion = typeof postVersions.$inferSelect;
export type InsertPostVersion = typeof postVersions.$inferInsert;
