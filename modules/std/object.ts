/**
 * Returns a new object with the specified keys and their values.
 */
export function pick<T, K extends keyof T>(
	obj: T,
	keys: readonly K[],
): Pick<T, K> {
	const result: Partial<T> = {};

	for (const key of keys) {
		result[key] = obj[key];
	}

	return result as Pick<T, K>;
}

/**
 * Returns a new object with the specified keys removed.
 */
export function omit<T, K extends keyof T>(
	obj: T,
	keys: readonly K[],
): Omit<T, K> {
	const result = { ...obj };

	for (const key of keys) {
		delete result[key];
	}

	return result;
}
