import { type ComponentProps, splitProps } from "solid-js";
import { mergeClasses } from "~/utils/solid";
import styles from "./Button.module.css";

interface ButtonProps extends ComponentProps<"button"> {
	variant?: "solid" | "subtle" | "outline" | "ghost" | "link";
	size?: "xs" | "sm" | "md";
	type?: "button" | "submit" | "reset";
	class?: string;
}

const variantToClass = {
	solid: styles.solid,
	subtle: styles.subtle,
	outline: styles.outline,
	ghost: styles.ghost,
	link: styles.link,
};

const sizeToClass = {
	xs: styles.xs,
	sm: styles.sm,
	md: styles.md,
};

export function Button(props: ButtonProps) {
	const [, buttonParams] = splitProps(props, [
		"children",
		"class",
		"size",
		"variant",
	]);

	const withDefaults = {
		variant: "subtle",
		size: "md",
		type: "button",
		class: "",
		...props,
	} as const;

	const classes = mergeClasses(
		styles.button,
		variantToClass[withDefaults.variant],
		sizeToClass[withDefaults.size],
		props.class,
	);

	return (
		<button {...buttonParams} class={classes}>
			{props.children}
		</button>
	);
}
