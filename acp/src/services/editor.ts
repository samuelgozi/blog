import { Editor } from "@tiptap/core";
import Blockquote from "@tiptap/extension-blockquote";
import Bold from "@tiptap/extension-bold";
import Code from "@tiptap/extension-code";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import {
	BulletList,
	ListItem,
	OrderedList,
	TaskItem,
	TaskList,
} from "@tiptap/extension-list";
import Paragraph from "@tiptap/extension-paragraph";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import {
	Dropcursor,
	Placeholder,
	TrailingNode,
	UndoRedo,
} from "@tiptap/extensions";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { all, createLowlight } from "lowlight";
import { createSignal } from "solid-js";

const lowlight = createLowlight(all);
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

const extensions = [
	Document,
	Text,
	Paragraph,

	Heading,
	Blockquote,
	OrderedList,
	BulletList,
	ListItem,
	TaskList,
	TaskItem,
	HardBreak,

	Bold,
	Code,
	Italic,
	Link,
	Strike,
	Underline,

	Image,
	CodeBlockLowlight.configure({ lowlight }),

	Placeholder.configure({ placeholder: "Write something …" }),
	Dropcursor,
	UndoRedo,
	TrailingNode,
];

export function createEditor() {
	const [editor, setEditor] = createSignal(
		new Editor({
			extensions,
			autofocus: true,
			onTransaction() {
				setEditor((editor) => editor);
			},
		}),
		{ equals: false },
	);

	return editor;
}
