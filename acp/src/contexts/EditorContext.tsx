/**
 * PostEditorContext provides a complete editing interface for blog posts.
 *
 * This context manages the full lifecycle of post creation and editing:
 * 1. Creating new posts (creates a post with initial published revision)
 * 2. Creating drafts from existing posts (branches from current head)
 * 3. Updating draft content
 * 4. Publishing drafts (making them the new head revision)
 * 5. Loading existing posts and their drafts
 *
 * Key concepts:
 * - Posts always have at least one published revision (the "head")
 * - Drafts are unpublished revisions that branch from the head
 * - Only one draft can be actively edited at a time
 * - Publishing a draft makes it the new head revision
 *
 * Exported methods:
 * - saveChanges(): Creates a new post or updates the current draft
 * - createDraft(): Creates a new draft from the current post's head
 * - publish(): Publishes the current draft as the new head
 * - loadPost(): Loads an existing post and its drafts into the editor
 *
 * State accessors:
 * - title/content/cover: Current editor content
 * - changeNote: Description of changes for the current draft
 * - postId: ID of the current post (null for new posts)
 * - draftId: ID of the current draft (null when not editing)
 * - isEditing: Whether a draft is being edited (derived from draftId)
 * - isDirty: Whether there are unsaved changes
 * - isLoading: Whether an async operation is in progress
 */
import {
	type Accessor,
	createContext,
	createSignal,
	type ParentProps,
	type Setter,
	useContext,
} from "solid-js";
import * as postsService from "../services/posts";

interface PostEditorAPI {
	title: Accessor<string>;
	setTitle: Setter<string>;

	content: Accessor<string>;
	setContent: Setter<string>;

	cover: Accessor<string>;
	setCover: Setter<string>;

	changeNote: Accessor<string>;
	setChangeNote: Setter<string>;

	postId: Accessor<string | null>;
	draftId: Accessor<string | null>;
	isEditing: Accessor<boolean>;
	isDirty: Accessor<boolean>;
	isLoading: Accessor<boolean>;

	saveChanges: () => Promise<void>;
	createDraft: () => Promise<void>;
	publish: () => Promise<void>;
	loadPost: (postId: string) => Promise<void>;
}

const PostEditorContext = createContext<PostEditorAPI>();

export function PostEditorProvider(props: ParentProps) {
	const [title, setTitle] = createSignal("");
	const [content, setContent] = createSignal("");
	const [cover, setCover] = createSignal("");
	const [changeNote, setChangeNote] = createSignal("");
	const [postId, setPostId] = createSignal<string | null>(null);
	const [draftId, setDraftId] = createSignal<string | null>(null);
	const [isLoading, setIsLoading] = createSignal(false);

	// Derived state
	const isEditing = () => draftId() !== null;
	const isDirty = () => {
		// Could implement more sophisticated dirty checking
		return isEditing();
	};

	async function saveChanges() {
		setIsLoading(true);
		try {
			const currentPostId = postId();
			const currentDraftId = draftId();

			if (!currentPostId) {
				// Create a new post with initial revision
				const result = await postsService.createPost({
					title: title() || undefined,
					content: content() || undefined,
					cover: cover() || undefined,
				});

				setPostId(result.post.id);
				return;
			}

			if (!currentDraftId)
				throw new Error("No draft to save. Create a draft first.");

			// Update existing draft
			await postsService.updateDraft(currentPostId, {
				title: title() || undefined,
				content: content() || undefined,
				cover: cover() || undefined,
				changeNote: changeNote() || undefined,
			});
		} finally {
			setIsLoading(false);
		}
	}

	async function createDraft() {
		setIsLoading(true);
		try {
			const currentPostId = postId();

			if (!currentPostId)
				throw new Error("Cannot create draft for unsaved post");

			// Create a new draft from current head
			const result = await postsService.createDraft(currentPostId);

			setDraftId(result.revision.id);
			setChangeNote("");
		} finally {
			setIsLoading(false);
		}
	}

	async function publish() {
		setIsLoading(true);
		try {
			const currentPostId = postId();
			const currentDraftId = draftId();

			if (!currentPostId || !currentDraftId)
				throw new Error("No draft to publish");

			await postsService.publishDraft(currentPostId, currentDraftId);

			// Clear draft state after publishing
			setDraftId(null);
			setChangeNote("");
		} finally {
			setIsLoading(false);
		}
	}

	async function loadPost(id: string) {
		setIsLoading(true);
		try {
			const postData = await postsService.getPost(id);

			setPostId(id);
			setTitle(postData.currentRevision.title || "");
			setContent(postData.currentRevision.content || "");
			setCover(postData.currentRevision.cover || "");

			// Check if there's an active draft
			const activeDraft = postData.drafts.find((d) => !d.isStale);
			if (activeDraft) setDraftId(activeDraft.id);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<PostEditorContext.Provider
			value={{
				title,
				setTitle,
				content,
				setContent,
				cover,
				setCover,
				changeNote,
				setChangeNote,
				postId,
				draftId,
				isEditing,
				isDirty,
				isLoading,
				saveChanges,
				createDraft,
				publish,
				loadPost,
			}}
		>
			{props.children}
		</PostEditorContext.Provider>
	);
}

export function usePostEditor() {
	const context = useContext(PostEditorContext);
	if (!context)
		throw new Error("usePostEditor must be used within a PostEditorProvider");
	return context;
}
