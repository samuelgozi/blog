import { Elysia, t } from "elysia";
import { signIn } from "../services/auth";
import { tokens } from "../services/tokens";

const authSchema = {
	body: t.Object({
		username: t.String(),
		password: t.String(),
	}),
};

export const auth = new Elysia().post(
	"/auth",
	async ({status, body}) => {
		const user = await signIn(
			body.username,
			body.password,
		);

		if (!user) return status(401, "Invalid credentials")

		return {
			user,
			token: await tokens.encrypt({user: user.id}),
		};
	},
	authSchema,
);
