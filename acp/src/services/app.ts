import type { App } from "@app/server/main.ts";
import { treaty } from "@elysiajs/eden";
import { auth } from "./auth";

export const app = treaty<App>("localhost:8000", {
  onRequest() {
		const authToken = auth()?.token;

		if (authToken) return {
			headers: {
				Authorization: authToken
			}
		}
  }
})
