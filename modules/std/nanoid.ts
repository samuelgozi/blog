// Inspired by Nanoid (I also made a PR since this implementation is much faster):
// https://github.com/ai/nanoid/pull/466
//
// For collision probability:
// https://zelark.github.io/nano-id-cc/
export function nanoid(size = 21) {
	let id = "";
	const chars =
		"useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
	const bytes = crypto.getRandomValues(new Uint8Array(size));
	while (size--) {
		// Using the bitwise AND operator to "cap" the value of
		// the random byte from 255 to 63. That way we can make sure
		// that the value will be a valid index for the "chars" string.
		id += chars[bytes[size]! & 63];
	}

	return id;
}
