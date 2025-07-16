import { Elysia, t } from "elysia";
import { getPosterBuffer, uploadPoster } from "../services/media";
import { authenticateRequest } from "../utils/authentication";

export const media = new Elysia()
	.post(
		"/media",
		async ({ body, headers, status }) => {
			const auth = await authenticateRequest(headers);
			if (!auth) return status(401, "Unauthorized");

			try {
				return await uploadPoster(body.image);
			} catch (error) {
				console.error(error);
				return status(500, "Internal Server Error");
			}
		},
		{
			body: t.Object({
				image: t.File({
					type: "image",
					maxSize: "10m",
				}),
			}),
		},
	)
	.get("posters/:id", async (context) => {
		const delimeterIdx = context.params.id.lastIndexOf(".");
		const id = context.params.id.substring(0, delimeterIdx);
		const extension = context.params.id.substring(delimeterIdx + 1);

		if (extension !== "webp" && extension !== "jpeg")
			return context.status(404);

		const poster = await getPosterBuffer(id, extension);
		if (!poster) return context.status(404);

		context.set.headers["content-type"] = `image/${extension}`;

		return poster;
	});
