import { createSignal } from "solid-js";
import { EditorPoster } from "~/comps/EditorPoster";
import { Editor } from "../comps/Editor";
import { createEditor } from "../services/editor";
import styles from "./Editor.module.css";

export default function EditorRoute() {
	const [title, setTitle] = createSignal("");
	const editor = createEditor();

	function handleChange(e: Event) {
		console.log(e);
	}

	return (
		<div class={styles.container}>
			<div
				role="textbox"
				class={styles.title}
				contentEditable="plaintext-only"
				onInput={handleChange}
			>
				{title()}
			</div>

			<EditorPoster />
			<Editor editor={editor()} />
		</div>
	);
}
