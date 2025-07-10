import { Elysia, t } from "elysia";
import * as postsService from "../services/posts";
import { authenticateRequest } from "../utils/authentication";

const createPostSchema = {
	body: t.Object({
		title: t.String(),
		content: t.Optional(t.String()),
		cover: t.Optional(t.String()),
		authorId: t.String(),
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

const createDraftSchema = {
	body: t.Object({
		title: t.String(),
		content: t.Optional(t.String()),
		cover: t.Optional(t.String()),
		changeNote: t.Optional(t.String()),
	}),
};

export const posts = new Elysia({ prefix: "/posts" })
	// Create a new post
	.post(
		"/",
		async (context) => {
			const auth = await authenticateRequest(context);
			if (!auth) {
				context.set.status = 401;
				return "Unauthorized";
			}

			try {
				const result = await postsService.createPost({
					...context.body,
					createdBy: auth.user,
				});

				context.set.status = 201;
				return result;
			} catch (error) {
				context.set.status = 500;
				return "Failed to create post";
			}
		},
		createPostSchema,
	)

	// Get post with current version
	.get("/:id", async (context) => {
		const auth = await authenticateRequest(context);
		if (!auth) {
			context.set.status = 401;
			return "Unauthorized";
		}

		try {
			const result = await postsService.getPostWithCurrentVersion(
				context.params.id,
			);
			if (!result) {
				context.set.status = 404;
				return "Post not found";
			}

			return result;
		} catch (error) {
			context.set.status = 500;
			return "Failed to get post";
		}
	})

	// Get current draft
	.get("/:id/draft", async (context) => {
		const auth = await authenticateRequest(context);
		if (!auth) {
			context.set.status = 401;
			return "Unauthorized";
		}

		try {
			const draft = await postsService.getCurrentDraft(context.params.id);
			if (!draft) {
				context.set.status = 404;
				return "No draft found";
			}

			return draft;
		} catch (error) {
			context.set.status = 500;
			return "Failed to get draft";
		}
	})

	// Create or replace draft
	.put(
		"/:id/draft",
		async (context) => {
			const auth = await authenticateRequest(context);
			if (!auth) {
				context.set.status = 401;
				return "Unauthorized";
			}

			try {
				const result = await postsService.createOrUpdateDraft({
					postId: context.params.id,
					...context.body,
					createdBy: auth.user,
				});

				if (result.isNew) {
					context.set.status = 201;
				}

				return result;
			} catch (error) {
				context.set.status = 500;
				return "Failed to create or update draft";
			}
		},
		createDraftSchema,
	)

	// Update draft (partial update)
	.patch(
		"/:id/draft",
		async (context) => {
			const auth = await authenticateRequest(context);
			if (!auth) {
				context.set.status = 401;
				return "Unauthorized";
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
					context.set.status = 404;
					return "No draft found to update";
				}
				context.set.status = 500;
				return "Failed to update draft";
			}
		},
		updateDraftSchema,
	)

	// Delete draft
	.delete("/:id/draft", async (context) => {
		const auth = await authenticateRequest(context);
		if (!auth) {
			context.set.status = 401;
			return "Unauthorized";
		}

		try {
			await postsService.deleteDraft(context.params.id);
			context.set.status = 204;
			return;
		} catch (error) {
			if (error instanceof Error && error.message.includes("No draft found")) {
				context.set.status = 404;
				return "No draft found to delete";
			}
			context.set.status = 500;
			return "Failed to delete draft";
		}
	})

	// Get all versions
	.get("/:id/versions", async (context) => {
		const auth = await authenticateRequest(context);
		if (!auth) {
			context.set.status = 401;
			return "Unauthorized";
		}

		try {
			const versions = await postsService.getPostVersions(context.params.id);
			return versions;
		} catch (error) {
			context.set.status = 500;
			return "Failed to get post versions";
		}
	})

	// Get published version
	.get("/:id/published", async (context) => {
		const auth = await authenticateRequest(context);
		if (!auth) {
			context.set.status = 401;
			return "Unauthorized";
		}

		try {
			const version = await postsService.getPublishedVersion(context.params.id);
			if (!version) {
				context.set.status = 404;
				return "No published version found";
			}

			return version;
		} catch (error) {
			context.set.status = 500;
			return "Failed to get published version";
		}
	})

	// Get working version (draft if exists, otherwise published)
	.get("/:id/working", async (context) => {
		const auth = await authenticateRequest(context);
		if (!auth) {
			context.set.status = 401;
			return "Unauthorized";
		}

		try {
			const result = await postsService.getWorkingVersion(context.params.id);
			if (!result) {
				context.set.status = 404;
				return "No version found";
			}

			return result;
		} catch (error) {
			context.set.status = 500;
			return "Failed to get working version";
		}
	})

	// Get post status/info
	.get("/:id/status", async (context) => {
		const auth = await authenticateRequest(context);
		if (!auth) {
			context.set.status = 401;
			return "Unauthorized";
		}

		try {
			const hasDraft = await postsService.hasDraft(context.params.id);
			const publishedVersion = await postsService.getPublishedVersion(context.params.id);

			return {
				hasDraft,
				hasPublished: publishedVersion !== null,
				publishedAt: publishedVersion ? publishedVersion.createdAt : null,
			};
		} catch (error) {
			context.set.status = 500;
			return "Failed to get post status";
		}
	})

	// Publish current draft (action)
	.post("/:id/publish", async (context) => {
		const auth = await authenticateRequest(context);
		if (!auth) {
			context.set.status = 401;
			return "Unauthorized";
		}

		try {
			const publishedVersion = await postsService.publishDraft(
				context.params.id,
			);
			return publishedVersion;
		} catch (error) {
			if (error instanceof Error && error.message.includes("No draft found")) {
				context.set.status = 404;
				return "No draft found to publish";
			}
			context.set.status = 500;
			return "Failed to publish draft";
		}
	})

	// Create draft from published version (action)
	.post("/:id/draft/from-published", async (context) => {
		const auth = await authenticateRequest(context);
		if (!auth) {
			context.set.status = 401;
			return "Unauthorized";
		}

		try {
			const result = await postsService.createDraftFromPublished(
				context.params.id,
				auth.user,
			);

			if (result.isNew) {
				context.set.status = 201;
			}

			return result;
		} catch (error) {
			if (
				error instanceof Error &&
				error.message.includes("No published version found")
			) {
				context.set.status = 404;
				return "No published version found to create draft from";
			}
			context.set.status = 500;
			return "Failed to create draft from published version";
		}
	});
