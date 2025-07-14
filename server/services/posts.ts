import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../db";
import {
	type InsertPost,
	type InsertRevision,
	posts,
	revisions,
	type SelectPost,
	type SelectRevision,
} from "../schema/posts";

export interface CreatePostInput {
	title?: string;
	content?: string;
	cover?: string;
	authorId: string;
	createdBy: string;
}

export interface UpdateDraftInput {
	title?: string;
	content?: string;
	cover?: string;
	changeNote?: string;
}

export interface DraftSummary {
	id: string;
	title: string | null;
	createdBy: string;
	createdAt: string;
	isStale: boolean;
}

export interface PostWithDrafts {
	id: string;
	title: string | null;
	publishedAt: string | null;
	authorId: string;
	drafts: DraftSummary[];
}

export interface PostDetails {
	post: SelectPost;
	currentRevision: SelectRevision;
	drafts: DraftSummary[];
}

/**
 * Creates a new post with its first revision
 */
export async function createPost(
	input: CreatePostInput,
): Promise<{ post: SelectPost; revision: SelectRevision }> {
	return await db.transaction(async (tx) => {
		// Create the post first with empty headRevisionId
		const [newPost] = await tx
			.insert(posts)
			.values({
				headRevisionId: "",
				authorId: input.authorId,
				publishedAt: null,
			} satisfies InsertPost)
			.returning();

		if (!newPost) throw new Error("Failed to create post");

		// Create the first revision
		const [firstRevision] = await tx
			.insert(revisions)
			.values({
				postId: newPost.id,
				parentRevisionId: null,
				title: input.title,
				content: input.content,
				cover: input.cover,
				changeNote: "Initial revision",
				createdBy: input.createdBy,
			} satisfies InsertRevision)
			.returning();

		if (!firstRevision) throw new Error("Failed to create first revision");

		// Update post to reference the first revision as head
		await tx
			.update(posts)
			.set({
				headRevisionId: firstRevision.id,
				publishedAt: new Date().toISOString(),
			})
			.where(eq(posts.id, newPost.id));

		return { post: newPost, revision: firstRevision };
	});
}

/**
 * Gets post with current revision and draft summaries
 */
export async function getPostWithDrafts(
	postId: string,
): Promise<PostDetails | null> {
	const post = await getPost(postId);
	if (!post) return null;

	const currentRevision = await getRevision(post.headRevisionId);
	if (!currentRevision) throw new Error("Post head revision not found");

	const drafts = await getDraftSummaries(postId, post.headRevisionId);

	return {
		post,
		currentRevision,
		drafts,
	};
}

/**
 * Lists all posts with their draft summaries
 */
export async function listPostsWithDrafts(): Promise<PostWithDrafts[]> {
	const allPosts = await db.select().from(posts);

	const result: PostWithDrafts[] = [];

	for (const post of allPosts || []) {
		const currentRevision = await getRevision(post.headRevisionId);
		if (!currentRevision) continue;

		const drafts = await getDraftSummaries(post.id, post.headRevisionId);

		result.push({
			id: post.id,
			title: currentRevision.title,
			publishedAt: post.publishedAt,
			authorId: post.authorId,
			drafts,
		});
	}

	return result;
}

/**
 * Creates a new draft revision from the current head
 */
export async function createDraft(
	postId: string,
	createdBy: string,
): Promise<{ revision: SelectRevision; baseRevisionId: string }> {
	const post = await getPost(postId);
	if (!post) throw new Error("Post not found");

	const headRevision = await getRevision(post.headRevisionId);
	if (!headRevision) throw new Error("Head revision not found");

	const [newRevision] = await db
		.insert(revisions)
		.values({
			postId,
			parentRevisionId: post.headRevisionId,
			title: headRevision.title,
			content: headRevision.content,
			cover: headRevision.cover,
			changeNote: "Draft created from published version",
			createdBy,
		} satisfies InsertRevision)
		.returning();

	if (!newRevision) throw new Error("Failed to create draft");

	return {
		revision: newRevision,
		baseRevisionId: post.headRevisionId,
	};
}

/**
 * Updates a draft revision
 */
export async function updateDraft(
	postId: string,
	updates: UpdateDraftInput,
): Promise<SelectRevision> {
	// For simplicity, we'll update the most recent draft
	// In a more complex system, you might specify the exact revision ID
	const latestDraft = await getLatestDraft(postId);
	if (!latestDraft) throw new Error("No draft found to update");

	const updateFields = Object.fromEntries(
		Object.entries(updates).filter(([_, value]) => value !== undefined),
	) as Partial<InsertRevision>;

	const [updatedRevision] = await db
		.update(revisions)
		.set(updateFields)
		.where(eq(revisions.id, latestDraft.id))
		.returning();

	if (!updatedRevision) throw new Error("Failed to update draft");
	return updatedRevision;
}

/**
 * Accepts a draft by making it the new head
 */
export async function acceptDraft(
	postId: string,
	revisionId: string,
): Promise<{ revision: SelectRevision; wasStale: boolean }> {
	const revision = await getRevision(revisionId);
	if (!revision) throw new Error("Revision not found");

	if (revision.postId !== postId)
		throw new Error("Revision does not belong to this post");

	const post = await getPost(postId);
	if (!post) throw new Error("Post not found");

	// Check if draft is stale (parent is not current head)
	const wasStale = revision.parentRevisionId !== post.headRevisionId;

	await db
		.update(posts)
		.set({
			headRevisionId: revisionId,
			publishedAt: new Date().toISOString(),
		})
		.where(eq(posts.id, postId));

	return { revision, wasStale };
}

/**
 * Gets the published history using recursive CTE
 */
export async function getPostHistory(
	postId: string,
): Promise<SelectRevision[]> {
	const post = await getPost(postId);
	if (!post) throw new Error("Post not found");

	const result = await db.all(sql`
		WITH RECURSIVE history AS (
			SELECT
				id, postId, parentRevisionId, title, content, cover,
				changeNote, createdBy, createdAt, 0 as depth
			FROM revisions
			WHERE id = ${post.headRevisionId}

			UNION ALL

			SELECT
				r.id, r.postId, r.parentRevisionId, r.title, r.content, r.cover,
				r.changeNote, r.createdBy, r.createdAt, h.depth + 1
			FROM revisions r
			INNER JOIN history h ON r.id = h.parentRevisionId
		)
		SELECT * FROM history ORDER BY depth
	`);

	return result as SelectRevision[];
}

/**
 * Deletes a draft revision
 */
export async function deleteDraft(
	postId: string,
	revisionId: string,
): Promise<boolean> {
	const revision = await getRevision(revisionId);
	if (!revision) throw new Error("Revision not found");

	if (revision.postId !== postId)
		throw new Error("Revision does not belong to this post");

	const post = await getPost(postId);
	if (!post) throw new Error("Post not found");

	// Cannot delete the current head
	if (revisionId === post.headRevisionId) {
		throw new Error("Cannot delete the current published revision");
	}

	await db.delete(revisions).where(eq(revisions.id, revisionId));
	return true;
}

/**
 * Deletes a post and all its revisions
 */
export async function deletePost(postId: string): Promise<boolean> {
	await db.delete(posts).where(eq(posts.id, postId));
	return true;
}

// Helper functions

async function getPost(postId: string): Promise<SelectPost | null> {
	const [post] = await db
		.select()
		.from(posts)
		.where(eq(posts.id, postId))
		.limit(1);

	return post || null;
}

async function getRevision(revisionId: string): Promise<SelectRevision | null> {
	const [revision] = await db
		.select()
		.from(revisions)
		.where(eq(revisions.id, revisionId))
		.limit(1);

	return revision || null;
}

async function getDraftSummaries(
	postId: string,
	headRevisionId: string,
): Promise<DraftSummary[]> {
	const allRevisions = await db
		.select({
			id: revisions.id,
			title: revisions.title,
			createdBy: revisions.createdBy,
			createdAt: revisions.createdAt,
			parentRevisionId: revisions.parentRevisionId,
		})
		.from(revisions)
		.where(and(eq(revisions.postId, postId), ne(revisions.id, headRevisionId)));

	return allRevisions.map((revision) => ({
		id: revision.id,
		title: revision.title,
		createdBy: revision.createdBy,
		createdAt: revision.createdAt,
		isStale: revision.parentRevisionId !== headRevisionId,
	}));
}

async function getLatestDraft(postId: string): Promise<SelectRevision | null> {
	const post = await getPost(postId);
	if (!post) return null;

	const [latestDraft] = await db
		.select()
		.from(revisions)
		.where(
			and(eq(revisions.postId, postId), ne(revisions.id, post.headRevisionId)),
		)
		.orderBy(desc(revisions.createdAt))
		.limit(1);

	return latestDraft || null;
}
