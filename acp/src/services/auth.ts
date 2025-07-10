import { createEffect, createSignal } from "solid-js";
import { app } from "./app";

interface User {
	id: string;
	username: string;
	updatedAt: Date;
	createdAt: Date;
}

interface Auth {
	user: User;
	token: string;
}

export const [auth, setAuth] = createSignal<Auth | null>(null);

createEffect(() => {
	setAuth(JSON.parse(localStorage.getItem("auth") ?? "null"));
});

export async function signIn(username: string, password: string) {
	const response = await app.auth.post({ username, password });
	if (response.error) throw response.error.value;

	setAuth({
		user: {
			id: response.data.user.id,
			username: response.data.user.username,
			updatedAt: new Date(response.data.user.updatedAt),
			createdAt: new Date(response.data.user.createdAt),
		},
		token: response.data.token,
	});
}

export async function signOut() {
	setAuth(null);
}
