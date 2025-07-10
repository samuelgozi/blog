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
	async (context) => {
		const user = await signIn(
			context.body.username,
			context.body.password,
		);

		if (!user) {
			context.set.status = 401;
			return;
		}

		return {
			...user,
			token: await tokens.encrypt({user: user.id}),
		};
	},
	authSchema,
);
