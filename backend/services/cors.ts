import corsMiddleware from "@elysiajs/cors";

export const cors =
	process.env.NODE_ENV === "production"
		? corsMiddleware({ origin: /^https?:\/\/(.*\.)?reaper\.io$/ })
		: corsMiddleware({ origin: true });
