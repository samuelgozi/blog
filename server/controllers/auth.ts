import { Elysia, t } from "elysia";
import { signIn } from "../services/auth";
import { tokens } from "../services/tokens";

const authSchema = {
	body: t.Object({
		username: t.String({ minLength: 3, maxLength: 255 }),
		password: t.String({ minLength: 8, maxLength: 255 }),
	}),
};

export const auth = new Elysia().post(
	"/auth",
	async ({ status, body }) => {
		const user = await signIn(body.username, body.password);

		if (!user) return status(401, "Invalid credentials");

		return {
			user,
			token: await tokens.encrypt({ user: user.id }),
		};
	},
	authSchema,
);
