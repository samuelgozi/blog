import { Tooltip, useTooltip } from "@ark-ui/solid/tooltip";
import type { Editor as EditorCore } from "@tiptap/core";
import {
	Bold,
	Code,
	Heading1,
	Heading2,
	Heading3,
	Image,
	Italic,
	Link,
	List,
	ListOrdered,
	ListTodo,
	type LucideIcon,
	Quote,
	Redo2,
	Strikethrough,
	Underline,
	Undo2,
} from "lucide-solid";
import { onCleanup, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import styles from "./Editor.module.css";

interface ToolboxButtonProps {
	name: string;
	icon: LucideIcon;
	action: () => void;
	active: () => boolean;
}

function ToolboxButton(props: ToolboxButtonProps) {
	const tooltip = useTooltip();
	return (
		<Tooltip.RootProvider value={tooltip}>
			<Tooltip.Trigger
				type="button"
				classList={{ [styles.button]: true, [styles.active]: props.active() }}
				onClick={props.action}
			>
				<props.icon size={16} />
			</Tooltip.Trigger>
			<Show when={tooltip().open}>
				<Portal>
					<Tooltip.Positioner>
						<Tooltip.Content>{props.name}</Tooltip.Content>
					</Tooltip.Positioner>
				</Portal>
			</Show>
		</Tooltip.RootProvider>
	);
}

function Separator() {
	return <div class={styles.separator} />;
}

interface ToolboxProps {
	editor: EditorCore;
}

function Toolbox(props: ToolboxProps) {
	return (
		<div class={styles.toolbox}>
			<ToolboxButton
				name="Undo"
				icon={Undo2}
				action={() => props.editor.chain().focus().undo().run()}
				active={() => props.editor.can().undo()}
			/>
			<ToolboxButton
				name="Redo"
				icon={Redo2}
				action={() => props.editor.chain().focus().redo().run()}
				active={() => props.editor.can().redo()}
			/>
			<Separator />
			<ToolboxButton
				name="Heading 1"
				icon={Heading1}
				action={() =>
					props.editor.chain().focus().toggleHeading({ level: 1 }).run()
				}
				active={() => props.editor.isActive("heading", { level: 1 })}
			/>
			<ToolboxButton
				name="Heading 2"
				icon={Heading2}
				action={() =>
					props.editor.chain().focus().toggleHeading({ level: 2 }).run()
				}
				active={() => props.editor.isActive("heading", { level: 2 })}
			/>
			<ToolboxButton
				name="Heading 3"
				icon={Heading3}
				action={() =>
					props.editor.chain().focus().toggleHeading({ level: 3 }).run()
				}
				active={() => props.editor.isActive("heading", { level: 3 })}
			/>
			<Separator />
			<ToolboxButton
				name="Ordered List"
				icon={ListOrdered}
				action={() => props.editor.chain().focus().toggleOrderedList().run()}
				active={() => props.editor.isActive("orderedList")}
			/>
			<ToolboxButton
				name="Unordered List"
				icon={List}
				action={() => props.editor.chain().focus().toggleBulletList().run()}
				active={() => props.editor.isActive("bulletList")}
			/>
			<ToolboxButton
				name="Task List"
				icon={ListTodo}
				action={() => props.editor.chain().focus().toggleTaskList().run()}
				active={() => props.editor.isActive("taskList")}
			/>
			<Separator />
			<ToolboxButton
				name="Blockquote"
				icon={Quote}
				action={() => props.editor.chain().focus().toggleBlockquote().run()}
				active={() => props.editor.isActive("blockquote")}
			/>
			<ToolboxButton
				name="Code Block"
				icon={Code}
				action={() => props.editor.chain().focus().toggleCodeBlock().run()}
				active={() => props.editor.isActive("codeBlock")}
			/>
			<Separator />
			<ToolboxButton
				name="Bold"
				icon={Bold}
				action={() => props.editor.chain().focus().toggleBold().run()}
				active={() => props.editor.isActive("bold")}
			/>
			<ToolboxButton
				name="Italic"
				icon={Italic}
				action={() => props.editor.chain().focus().toggleItalic().run()}
				active={() => props.editor.isActive("italic")}
			/>
			<ToolboxButton
				name="Strikethrough"
				icon={Strikethrough}
				action={() => props.editor.chain().focus().toggleStrike().run()}
				active={() => props.editor.isActive("strike")}
			/>
			<ToolboxButton
				name="Underline"
				icon={Underline}
				action={() => props.editor.chain().focus().toggleUnderline().run()}
				active={() => props.editor.isActive("underline")}
			/>
			<ToolboxButton
				name="Link"
				icon={Link}
				action={() => props.editor.chain().focus().toggleLink().run()}
				active={() => props.editor.isActive("link")}
			/>
			<Separator />
			<ToolboxButton
				name="Image"
				icon={Image}
				action={() => {
					const url = window.prompt("Enter image URL:");
					if (url) {
						props.editor.chain().focus().setImage({ src: url }).run();
					}
				}}
				active={() => false}
			/>
		</div>
	);
}

interface EditorProps {
	editor: EditorCore;
}

export function Editor(props: EditorProps) {
	let el!: HTMLDivElement;

	onMount(() => {
		props.editor.mount(el);
	});

	onCleanup(() => {
		props.editor.unmount();
	});

	return (
		<div class={styles.editor_wrapper}>
			<Toolbox editor={props.editor} />
			<div class={styles.editor} ref={el} />
		</div>
	);
}
