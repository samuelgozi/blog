import { relations } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./helpers";

export const posts = sqliteTable(
	"posts",
	{
		id,
		headRevisionId: text().notNull(),
		authorId: text().notNull(),
		publishedAt: text(),
		...timestamps,
	},
	(table) => [
		index("posts_author_idx").on(table.authorId),
		index("posts_published_idx").on(table.publishedAt),
		index("posts_deleted_idx").on(table.deletedAt),
		index("posts_head_revision_idx").on(table.headRevisionId),
	],
);

export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export const revisions = sqliteTable(
	"revisions",
	{
		id,
		postId: text()
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		parentRevisionId: text(),
		title: text(),
		content: text(),
		cover: text(),
		changeNote: text(),
		createdBy: text().notNull(),
		createdAt: timestamps.createdAt,
	},
	(table) => [
		index("revisions_post_idx").on(table.postId),
		index("revisions_parent_idx").on(table.parentRevisionId),
		index("revisions_created_idx").on(table.createdAt),
	],
);

export type SelectRevision = typeof revisions.$inferSelect;
export type InsertRevision = typeof revisions.$inferInsert;

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
	headRevision: one(revisions, {
		fields: [posts.headRevisionId],
		references: [revisions.id],
	}),
	revisions: many(revisions),
}));

export const revisionsRelations = relations(revisions, ({ one, many }) => ({
	post: one(posts, {
		fields: [revisions.postId],
		references: [posts.id],
	}),
	parent: one(revisions, {
		fields: [revisions.parentRevisionId],
		references: [revisions.id],
		relationName: "parent",
	}),
	children: many(revisions, { relationName: "parent" }),
}));
