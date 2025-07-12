import type { ParentProps } from "solid-js";
import { mergeClasses } from "~/utils/solid";
import styles from "./Button.module.css";

interface ButtonProps extends ParentProps {
	variant?: "primary" | "secondary" | "transparent";
	size?: "medium" | "small" | "tiny";
	type?: "button" | "submit" | "reset";
	class?: string;
}

export function Button(props: ButtonProps) {
	const withDefaults = {
		variant: "primary",
		size: "medium",
		type: "button",
		class: "",
		...props,
	} as const;

	const classes = mergeClasses(
		styles.button,
		styles[withDefaults.variant],
		styles[withDefaults.size],
		props.class,
	);

	return (
		<button type={withDefaults.type} class={classes}>
			{props.children}
		</button>
	);
}
