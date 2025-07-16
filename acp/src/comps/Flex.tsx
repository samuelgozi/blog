import type { Component, ComponentProps } from "solid-js";
import { splitProps } from "solid-js";

type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
type AlignItems = "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
type JustifyContent =
	| "flex-start"
	| "flex-end"
	| "center"
	| "space-between"
	| "space-around"
	| "space-evenly";
type Gap = string | number | "space-1" | "space-2" | "space-3" | "space-4";

interface FlexProps extends ComponentProps<"div"> {
	display?: "flex" | "inline-flex";
	direction?: FlexDirection;
	align?: AlignItems;
	justify?: JustifyContent;
	wrap?: FlexWrap;
	gap?: Gap;
}

export const Flex: Component<FlexProps> = (props) => {
	const [local, others] = splitProps(props, [
		"display",
		"direction",
		"align",
		"justify",
		"wrap",
		"gap",
		"style",
		"children",
	]);

	const style = () => {
		return {
			display: local.display || "flex",
			"flex-direction": local.direction || "row",
			"align-items": local.align || "stretch",
			"justify-content": local.justify || "flex-start",
			"flex-wrap": local.wrap || "nowrap",
			gap: convertGapValue(local.gap),
			...(typeof local.style === "object" ? local.style : {}),
		};
	};

	return (
		<div style={style()} {...others}>
			{local.children}
		</div>
	);
};

function convertGapValue(gap?: Gap) {
	if (gap === undefined) return undefined;
	if (typeof gap === "number") return `${gap}px`;
	// Check if it matches "space-1" through "space-4" pattern
	if (/^space-[1-4]$/.test(gap)) return `var(--${gap})`;
	// Otherwise pass the string as-is
	return gap;
}
