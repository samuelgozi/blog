import { Elysia, t } from "elysia";
import * as postsService from "../services/posts";
import { authenticateRequest } from "../utils/authentication";

const createPostSchema = {
	body: t.Object({
		title: t.Optional(t.String()),
		content: t.Optional(t.String()),
		cover: t.Optional(t.String()),
	}),
};

const updateDraftSchema = {
	body: t.Object({
		title: t.Optional(t.String()),
		content: t.Optional(t.String()),
		cover: t.Optional(t.String()),
		changeNote: t.Optional(t.String()),
	}),
};

export const posts = new Elysia({ prefix: "/posts" })
	// List all posts with draft summaries
	.get("/", ({ status }) => {
		return postsService.listPostsWithDrafts().catch((err) => {
			console.error("Failed to get posts:", err);
			return status(500, "Failed to get posts");
		});
	})

	// Create a new post
	.post(
		"/",
		async (context) => {
			const auth = await authenticateRequest(context.headers);
			if (!auth) return context.status(401, "Unauthorized");

			return postsService
				.createPost({
					...context.body,
					createdBy: auth.user,
					authorId: auth.user,
				})
				.catch((err) => {
					console.error("Failed to create post:", err);
					return context.status(500, "Failed to create post");
				});
		},
		createPostSchema,
	)

	// Get post with current revision and draft summaries
	.get("/:id", async (context) => {
		try {
			const result = await postsService.getPostWithDrafts(context.params.id);
			if (!result) {
				return context.status(404, "Post not found");
			}

			return result;
		} catch (error) {
			console.error("Failed to get post:", error);
			return context.status(500, "Failed to get post");
		}
	})

	// Delete a post
	.delete("/:id", async (context) => {
		const auth = await authenticateRequest(context.headers);
		if (!auth) {
			return context.status(401, "Unauthorized");
		}

		try {
			await postsService.deletePost(context.params.id);
			return context.status(204);
		} catch (error) {
			console.error("Failed to delete post:", error);
			return context.status(500, "Failed to delete post");
		}
	})

	// Get post history (published timeline)
	.get("/:id/history", async (context) => {
		try {
			return await postsService.getPostHistory(context.params.id);
		} catch (error) {
			if (error instanceof Error && error.message.includes("Post not found")) {
				return context.status(404, "Post not found");
			}
			return context.status(500, "Failed to get post history");
		}
	})

	// Create a new draft
	.post("/:id/drafts", async (context) => {
		const auth = await authenticateRequest(context.headers);
		if (!auth) return context.status(401, "Unauthorized");

		try {
			return await postsService.createDraft(context.params.id, auth.user);
		} catch (error) {
			if (error instanceof Error && error.message.includes("Post not found")) {
				return context.status(404, "Post not found");
			}
			return context.status(500, "Failed to create draft");
		}
	})

	// Update a draft
	.patch(
		"/:id/drafts",
		async (context) => {
			const auth = await authenticateRequest(context.headers);
			if (!auth) {
				return context.status(401, "Unauthorized");
			}

			try {
				const updatedDraft = await postsService.updateDraft(
					context.params.id,
					context.body,
				);

				return updatedDraft;
			} catch (error) {
				if (
					error instanceof Error &&
					error.message.includes("No draft found")
				) {
					return context.status(404, "No draft found to update");
				}
				return context.status(500, "Failed to update draft");
			}
		},
		updateDraftSchema,
	)

	// Accept a draft (publish)
	.post("/:id/drafts/:revisionId/accept", async (context) => {
		const auth = await authenticateRequest(context.headers);
		if (!auth) {
			return context.status(401, "Unauthorized");
		}

		try {
			const result = await postsService.acceptDraft(
				context.params.id,
				context.params.revisionId,
			);

			return result;
		} catch (error) {
			if (
				error instanceof Error &&
				(error.message.includes("not found") ||
					error.message.includes("does not belong"))
			) {
				return context.status(404, error.message);
			}
			return context.status(500, "Failed to accept draft");
		}
	})

	// Delete a draft
	.delete("/:id/drafts/:revisionId", async (context) => {
		const auth = await authenticateRequest(context.headers);
		if (!auth) {
			return context.status(401, "Unauthorized");
		}

		try {
			await postsService.deleteDraft(
				context.params.id,
				context.params.revisionId,
			);
			return context.status(204);
		} catch (error) {
			if (
				error instanceof Error &&
				(error.message.includes("not found") ||
					error.message.includes("does not belong") ||
					error.message.includes("Cannot delete"))
			) {
				return context.status(404, error.message);
			}
			return context.status(500, "Failed to delete draft");
		}
	});
