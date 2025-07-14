import { tokens } from "../services/tokens";

export async function authenticateRequest(
	headers: Record<string, string | undefined>,
) {
	const token = headers.authorization?.trim();
	if (!token) return null;

	const auth = await tokens.decrypt(token);
	return auth !== null && !("user" in auth) ? null : auth;
}
