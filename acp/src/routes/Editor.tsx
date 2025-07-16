import { GitFork } from "lucide-solid";
import { createSignal, onMount } from "solid-js";
import { Button } from "~/comps/Button";
import { DateInput } from "~/comps/DateInput";
import { EditorPoster } from "~/comps/EditorPoster";
import { Flex } from "~/comps/Flex";
import { mergeClasses } from "~/utils/solid";
import { Editor } from "../comps/Editor";
import { createEditor } from "../services/editor";
import styles from "./Editor.module.css";

export default function EditorRoute() {
	const [title, setTitle] = createSignal("");
	const [poster, setPoster] = createSignal("");
	const editor = createEditor();

	return (
		<div class={styles.container}>
			<Sidebar />
			<TitleField title={title()} placeholder="Untitled" onChange={setTitle} />
			<EditorPoster poster={poster()} onChange={setPoster} />
			<Editor editor={editor()} />
		</div>
	);
}

interface TitleFieldProps {
	title: string;
	placeholder: string;
	onChange: (title: string) => void;
}

export function TitleField(props: TitleFieldProps) {
	let el!: HTMLDivElement;

	onMount(() => {
		el.textContent = props.title;

		el.addEventListener("input", (e) => {
			props.onChange((e.target as HTMLDivElement).textContent || "");
		});
	});

	const classes = () =>
		mergeClasses(styles.title, props.title.length === 0 && styles.empty);

	return (
		<div
			ref={el}
			role="textbox"
			tabIndex={0}
			class={classes()}
			aria-placeholder={props.placeholder}
			style={{ "--placeholder": `"${props.placeholder ?? ""}"` }}
			contentEditable="plaintext-only"
		/>
	);
}

interface SidebarProps {
	onSave?: () => void;
}

export function Sidebar(props: SidebarProps) {
	return (
		<div class={styles.sidebar}>
			<DateInput label="Publish Date" />
			<Flex gap="space-1">
				<Button size="md">
					<GitFork size={16} />
				</Button>
				<Button size="md" style={{ width: "100%" }}>
					Save
				</Button>
				<Button size="md" style={{ width: "100%" }}>
					Publish
				</Button>
			</Flex>
		</div>
	);
}
