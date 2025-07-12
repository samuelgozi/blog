/**
 * Merges classes together, filtering out any falsey values.
 */
export function mergeClasses(...classes: (string | boolean | undefined)[]) {
	return classes.filter(Boolean).join(" ");
}
