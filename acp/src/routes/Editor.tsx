import { Editor } from "../comps/Editor";
import { createEditor } from "../services/editor";

export default function EditorRoute() {
	const editor = createEditor();
	return <Editor editor={editor()} />;
}
