/**
 * Generate a new AES-GCM key
 */
export async function generateKey() {
	return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

/**
 * Function to export a CryptoKey to a Base64 string
 */
export async function keyToBase64(key: CryptoKey) {
	return Buffer.from(await crypto.subtle.exportKey("raw", key)).toString("base64url");
}

/**
 * Function to import a CryptoKey from a Base64 string
 */
export async function keyFromBase64(base64Key: string) {
	const buffer = Buffer.from(base64Key, "base64url");
	return crypto.subtle.importKey("raw", buffer, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
}
/**
 * Encrypt data using a CryptoKey
 */
export async function encryptData<T>(key: CryptoKey, data: T) {
	const encodedData = Buffer.from(JSON.stringify(data));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedData);
	return { encryptedData, iv };
}

/**
 * Decrypt data using a CryptoKey
 */
export async function decryptData<T>(key: CryptoKey, encryptedData: Buffer, iv: Buffer) {
	const bytes = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData);
	return JSON.parse(Buffer.from(bytes).toString()) as T;
}
