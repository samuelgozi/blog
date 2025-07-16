import { createEffect, createSignal, type JSX } from "solid-js";
import { mergeClasses } from "~/utils/solid";
import styles from "./Split.module.css";

interface HorizontalProps {
	class?: string;
	minSize?: string;
	defaultSize: string;
	right: JSX.Element;
	left: JSX.Element;
}

function Horizontal(props: HorizontalProps) {
	let container!: HTMLDivElement;
	let handle!: HTMLDivElement;
	let parentBoundingRect: DOMRect;
	let grabbingOffset = 0;
	const [activeHandle, setActiveHandle] = createSignal(false);
	const [leftSize, setLeftSize] = createSignal(
		Number.parseFloat(props.defaultSize),
	);
	const percent = () => props.defaultSize.at(-1) === "%";
	const primarySizeString = () => `${leftSize()}${percent() ? "%" : "px"}`;

	createEffect(() => {
		handle.addEventListener("mousedown", handleMouseDown);
		handle.addEventListener("dblclick", handleDoubleClick);

		return () => {
			// Remove event listeners if it were actively being resized.
			handleRelease();
			window.removeEventListener("mouseup", handleRelease);
		};
	});

	// When the cursor is moved while the handle is being dragged, calculate the new size of the column.
	function handleMove(event: MouseEvent) {
		const clientPos = event.clientX;
		const containerBounds = container.getBoundingClientRect();
		const adjustedClientPos = clientPos - grabbingOffset;
		let size = adjustedClientPos - containerBounds.left;

		// Convert the size to a percentage of the parent size
		if (percent()) size = (size / parentBoundingRect.width) * 100;

		setLeftSize(Math.max(0, size));
	}

	// When the mouse is released, stop tracking the cursor.
	function handleRelease() {
		setActiveHandle(false);
		document.documentElement.style.cursor = "";
		window.removeEventListener("mousemove", handleMove);
	}

	// When the handle is clicked, start tracking the cursor and release the handle when the mouse is released.
	function handleMouseDown(e: MouseEvent) {
		// Calculate the distance from the right edge of the container to the cursor.
		// This will be used to calculate the new width of the column relative to the mouse.
		const handleBounds = handle.getBoundingClientRect();
		grabbingOffset = e.clientX - handleBounds.right;

		// Get the size of the parent element.
		parentBoundingRect = container.parentElement!.getBoundingClientRect();
		// Set the handle as "active" so that it can be styled.
		setActiveHandle(true);
		// Set the cursor to the resize cursor.
		document.documentElement.style.cursor = "col-resize";

		// Add event listeners to track the cursor and release the handle.
		window.addEventListener("mouseup", handleRelease, { once: true });
		window.addEventListener("mousemove", handleMove);
	}

	// Reset the size to the default size when double clicked.
	function handleDoubleClick() {
		if (!props.defaultSize) return;
		setLeftSize(Number.parseFloat(props.defaultSize));
	}

	const classes = mergeClasses(
		styles.horizontal,
		props.class,
		props.reverse && styles.reverse,
	);
	return (
		<div
			ref={container}
			class={classes}
			style={{
				"--primary-size": primarySizeString(),
				"--min-size": props.minSize ?? "0px",
			}}
		>
			<div class={styles.left}>{props.left}</div>
			<div
				ref={handle}
				class={styles.handle}
				data-active={activeHandle()}
			></div>
			<div class={styles.right}>{props.right}</div>
		</div>
	);
}

export default {
	Horizontal,
};
