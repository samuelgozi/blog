import type { App } from "@app/server/main.ts";
import { treaty } from "@elysiajs/eden";

let authToken: string | null = null;

export function setClientToken(token: string | null) {
	authToken = token;
}

export const app = treaty<App>("localhost:8000", {
	onRequest() {
		if (authToken) {
			return {
				headers: {
					Authorization: authToken,
				},
			};
		}
	},
});
