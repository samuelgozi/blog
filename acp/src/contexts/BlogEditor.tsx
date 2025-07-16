import { type Accessor, createContext, type Setter } from "solid-js";

interface PostEditorAPI {
	title: Accessor<string>;
	setTitle: Setter<string>;

	content: Accessor<string>;
	setContent: Setter<string>;

	cover: Accessor<string>;
	setCover: Setter<string>;

	changeNote: Accessor<string>;
	setChangeNote: Setter<string>;

	saveChanges: () => Promise<void>;
	fork: () => Promise<string>;
}

const PostEditorContext = createContext<PostEditorAPI>();
