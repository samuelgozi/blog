import { tokens } from "../services/tokens";

interface HeadersContext {
	headers: Record<string, string | undefined>;
}

export async function authenticateRequest(context: HeadersContext) {
	const token = context.headers.authorization?.trim();
	if (!token) return null;

	const auth = await tokens.decrypt(token);
	// TODO: Log when the token is invalid.
	return auth !== null && !("user" in auth) ? null : auth;
}
