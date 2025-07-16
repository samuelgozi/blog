import { nanoid } from "@mod/std/nanoid";
import { s3, write } from "bun";
import sharp from "sharp";
import { db } from "../db";
import { media } from "../schema/media";

type MediaFormat = "webp" | "jpeg";

function getPosterRootPath(id: string) {
	return `posters/${id}/`;
}

function getOriginalPosterPath(id: string) {
	return `${getPosterRootPath(id)}original`;
}

function getPosterPath(id: string, format: MediaFormat) {
	return `${getPosterRootPath(id)}optimized_1280.${format}`;
}

export async function uploadPoster(image: File) {
	const id = nanoid();
	const originalPath = getOriginalPosterPath(id);
	const webpPath = getPosterPath(id, "webp");
	const jpegPath = getPosterPath(id, "jpeg");

	const byteArray = await image.arrayBuffer();
	const convertWebp = await sharp(byteArray)
		.resize(1280)
		.toFormat("webp")
		.toBuffer();
	const convertJpeg = await sharp(byteArray)
		.resize(1280)
		.toFormat("jpeg")
		.toBuffer();

	const originalMetadata = s3.file(originalPath, { type: image.type });
	const webpMetadata = s3.file(webpPath, { type: "image/webp" });
	const jpegMetadata = s3.file(jpegPath, { type: "image/jpeg" });

	await Promise.all([
		write(originalMetadata, image),
		write(webpMetadata, convertWebp),
		write(jpegMetadata, convertJpeg),
	]);

	await db
		.insert(media)
		.values({
			id,
			originalName: image.name,
			originalType: image.type,
		})
		.execute();

	return id;
}

export async function getPosterBuffer(id: string, format: MediaFormat) {
	const path = getPosterPath(id, format);
	return await s3
		.file(path)
		.arrayBuffer()
		.catch(() => null);
}
