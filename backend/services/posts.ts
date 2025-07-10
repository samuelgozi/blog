import { and, desc, eq } from "drizzle-orm";
import { pick } from "../../modules/std/object";
import { db } from "../db";
import {
	type InsertPost,
	type InsertPostVersion,
	posts,
	postVersions,
	type SelectPost,
	type SelectPostVersion,
} from "../schema/posts";

export interface CreatePostInput {
	title: string;
	content?: string;
	cover?: string;
	authorId: string;
	createdBy: string;
}

export interface CreateDraftInput {
	postId: string;
	title: string;
	content?: string;
	cover?: string;
	changeNote?: string;
	createdBy: string;
}

export interface UpdateDraftInput {
	title?: string;
	content?: string;
	cover?: string;
	changeNote?: string;
}

/**
 * Creates a new post with its first version as a draft
 */
export async function createPost(
	input: CreatePostInput,
): Promise<{ post: SelectPost; version: SelectPostVersion }> {
	return await db.transaction(async (tx) => {
		// Create the post first
		const [newPost] = await tx
			.insert(posts)
			.values({
				currentVersionId: "", // Will be updated after creating the version
				authorId: input.authorId,
				publishedAt: null,
			} satisfies InsertPost)
			.returning();

		if (!newPost) throw new Error("Failed to create post");

		// Create the first version as a draft
		const [firstVersion] = await tx
			.insert(postVersions)
			.values({
				postId: newPost.id,
				version: 1,
				status: "draft",
				title: input.title,
				content: input.content,
				cover: input.cover,
				createdBy: input.createdBy,
			} satisfies InsertPostVersion)
			.returning();

		if (!firstVersion) throw new Error("Failed to create first version");

		// Update the post to reference this version (even though it's a draft)
		await tx
			.update(posts)
			.set({ currentVersionId: firstVersion.id })
			.where(eq(posts.id, newPost.id));

		return { post: newPost, version: firstVersion };
	});
}

/**
 * Creates or updates a draft for an existing post
 * Enforces only one draft per post
 */
export async function createOrUpdateDraft(
	input: CreateDraftInput,
): Promise<{ version: SelectPostVersion; isNew: boolean }> {
	return await db.transaction(async (tx) => {
		// Check if a draft already exists
		const [existingDraft] = await tx
			.select()
			.from(postVersions)
			.where(
				and(
					eq(postVersions.postId, input.postId),
					eq(postVersions.status, "draft"),
				),
			)
			.limit(1);

		if (existingDraft) {
			// Update the existing draft
			const [updatedDraft] = await tx
				.update(postVersions)
				.set({
					title: input.title,
					content: input.content,
					cover: input.cover,
					changeNote: input.changeNote,
				} satisfies Partial<InsertPostVersion>)
				.where(eq(postVersions.id, existingDraft.id))
				.returning();

			if (!updatedDraft) throw new Error("Failed to update draft");
			return { version: updatedDraft, isNew: false };
		}

		// Get the next version number
		const [latestVersion] = await tx
			.select({ version: postVersions.version })
			.from(postVersions)
			.where(eq(postVersions.postId, input.postId))
			.orderBy(desc(postVersions.version))
			.limit(1);

		const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

		// Create a new draft
		const [newDraft] = await tx
			.insert(postVersions)
			.values({
				postId: input.postId,
				version: nextVersion,
				status: "draft",
				title: input.title,
				content: input.content,
				cover: input.cover,
				changeNote: input.changeNote,
				createdBy: input.createdBy,
			} satisfies InsertPostVersion)
			.returning();

		if (!newDraft) throw new Error("Failed to create draft");
		return { version: newDraft, isNew: true };
	});
}

/**
 * Creates a draft based on the current published version
 */
export async function createDraftFromPublished(
	postId: string,
	createdBy: string,
): Promise<{ version: SelectPostVersion; isNew: boolean }> {
	const publishedVersion = await getPublishedVersion(postId);
	if (!publishedVersion)
		throw new Error("No published version found to create draft from");

	const draftData = pick(publishedVersion, ["title", "content", "cover"]);

	return await createOrUpdateDraft({
		postId,
		title: draftData.title,
		content: draftData.content ?? undefined,
		cover: draftData.cover ?? undefined,
		changeNote: "Draft created from published version",
		createdBy,
	});
}

/**
 * Updates an existing draft
 */
export async function updateDraft(
	postId: string,
	updates: UpdateDraftInput,
): Promise<SelectPostVersion> {
	const draft = await getCurrentDraft(postId);
	if (!draft) throw new Error("No draft found to update");

	const updateFields = Object.fromEntries(
		Object.entries(updates).filter(([_, value]) => value !== undefined),
	) as Partial<InsertPostVersion>;

	const [updatedDraft] = await db
		.update(postVersions)
		.set(updateFields)
		.where(eq(postVersions.id, draft.id))
		.returning();

	if (!updatedDraft) throw new Error("Failed to update draft");
	return updatedDraft;
}

/**
 * Publishes a draft and updates the post's currentVersionId
 */
export async function publishDraft(postId: string): Promise<SelectPostVersion> {
	const draft = await getCurrentDraft(postId);
	if (!draft) throw new Error("No draft found to publish");

	return await db.transaction(async (tx) => {
		// Update the draft status to published
		const [publishedVersion] = await tx
			.update(postVersions)
			.set({ status: "published" } satisfies Partial<InsertPostVersion>)
			.where(eq(postVersions.id, draft.id))
			.returning();

		if (!publishedVersion) throw new Error("Failed to publish version");

		// Update the post's currentVersionId and publishedAt
		await tx
			.update(posts)
			.set({
				currentVersionId: publishedVersion.id,
				publishedAt: new Date().toISOString(),
			} satisfies Partial<InsertPost>)
			.where(eq(posts.id, postId));

		return publishedVersion;
	});
}

/**
 * Gets the current draft for a post (if any)
 */
export async function getCurrentDraft(
	postId: string,
): Promise<SelectPostVersion | null> {
	const [draft] = await db
		.select()
		.from(postVersions)
		.where(
			and(eq(postVersions.postId, postId), eq(postVersions.status, "draft")),
		)
		.limit(1);

	return draft || null;
}

/**
 * Gets the current published version for a post
 */
export async function getPublishedVersion(
	postId: string,
): Promise<SelectPostVersion | null> {
	const [post] = await db
		.select()
		.from(posts)
		.where(eq(posts.id, postId))
		.limit(1);

	if (!post || !post.currentVersionId) return null;

	const [publishedVersion] = await db
		.select()
		.from(postVersions)
		.where(eq(postVersions.id, post.currentVersionId))
		.limit(1);

	return publishedVersion || null;
}

/**
 * Gets the "working version" - draft if exists, otherwise published version
 */
export async function getWorkingVersion(
	postId: string,
): Promise<{ version: SelectPostVersion; isDraft: boolean } | null> {
	const draft = await getCurrentDraft(postId);
	if (draft) return { version: draft, isDraft: true };

	const published = await getPublishedVersion(postId);
	if (published) return { version: published, isDraft: false };

	return null;
}

/**
 * Gets all versions of a post
 */
export async function getPostVersions(
	postId: string,
): Promise<SelectPostVersion[]> {
	return await db
		.select()
		.from(postVersions)
		.where(eq(postVersions.postId, postId))
		.orderBy(desc(postVersions.version));
}

/**
 * Deletes a draft (if it exists)
 */
export async function deleteDraft(postId: string): Promise<boolean> {
	const draft = await getCurrentDraft(postId);
	if (!draft) throw new Error("No draft found to delete");

	await db.delete(postVersions).where(eq(postVersions.id, draft.id));
	return true;
}

/**
 * Checks if a post has a draft
 */
export async function hasDraft(postId: string): Promise<boolean> {
	const draft = await getCurrentDraft(postId);
	return draft !== null;
}

/**
 * Gets post with its current version info
 */
export async function getPostWithCurrentVersion(postId: string): Promise<{
	post: SelectPost;
	currentVersion: SelectPostVersion | null;
	isDraft: boolean;
	hasDraft: boolean;
} | null> {
	const [post] = await db
		.select()
		.from(posts)
		.where(eq(posts.id, postId))
		.limit(1);

	if (!post) return null;

	const workingVersion = await getWorkingVersion(postId);
	return {
		post,
		currentVersion: workingVersion?.version || null,
		isDraft: workingVersion?.isDraft || false,
		hasDraft: await hasDraft(postId),
	};
}
