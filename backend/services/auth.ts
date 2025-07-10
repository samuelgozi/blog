import { omit } from "@mod/std/object";
import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { users } from "../schema/users";

export async function createUser(username: string, password: string) {
	const hash = await Bun.password.hash(password);
	return await db.insert(users).values({ username, hash });
}

export async function signIn(username: string, password: string) {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(sql`lower(${users.username})`, username.toLowerCase()))
		.limit(1)
		.execute();

	const verified = await Bun.password.verify(password, user!.hash);

	if (!verified) null;

	return omit(user!, ["hash", "deletedAt"]);
}

export async function getUser(username: string) {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.username, username))
		.limit(1)
		.execute();

	return omit(user!, ["hash", "deletedAt"]);
}
