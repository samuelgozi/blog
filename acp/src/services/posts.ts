import { app } from "./app";

export interface CreatePostInput {
	title?: string;
	content?: string;
	cover?: string;
}

export interface UpdateDraftInput {
	title?: string;
	content?: string;
	cover?: string;
	changeNote?: string;
}

export async function createPost(input: CreatePostInput) {
	const response = await app.posts.post(input);
	if (response.error)
		throw new Error(`Failed to create post: ${response.error}`);

	return response.data;
}

export async function createDraft(postId: string) {
	const response = await app.posts({ id: postId }).drafts.post({});
	if (response.error)
		throw new Error(`Failed to create draft: ${response.error}`);

	return response.data;
}

export async function updateDraft(postId: string, input: UpdateDraftInput) {
	const response = await app.posts({ id: postId }).drafts.patch(input);

	if (response.error)
		throw new Error(`Failed to update draft: ${response.error}`);

	return response.data;
}

export async function publishDraft(postId: string, draftId: string) {
	const response = await app
		.posts({ id: postId })
		.drafts({ revisionId: draftId })
		.accept.post({});

	if (response.error)
		throw new Error(`Failed to publish draft: ${response.error}`);

	return response.data;
}

export async function deleteDraft(postId: string, draftId: string) {
	const response = await app
		.posts({ id: postId })
		.drafts({ revisionId: draftId })
		.delete();

	if (response.error)
		throw new Error(`Failed to delete draft: ${response.error}`);
}

export async function deletePost(postId: string): Promise<void> {
	const response = await app.posts({ id: postId }).delete();
	if (response.error)
		throw new Error(`Failed to delete post: ${response.error}`);
}

export async function getPost(postId: string) {
	const response = await app.posts({ id: postId }).get();
	if (response.error) throw new Error(`Failed to get post: ${response.error}`);
	return response.data;
}

export async function listPosts() {
	const response = await app.posts.get();
	if (response.error)
		throw new Error(`Failed to list posts: ${response.error}`);
	return response.data;
}
