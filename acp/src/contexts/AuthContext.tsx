import {
	createContext,
	createEffect,
	type ParentProps,
	useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { app, setAuthToken } from "../services/app";

interface User {
	id: string;
	username: string;
	updatedAt: Date;
	createdAt: Date;
}

type Auth =
	| {
			user: User;
			token: string;
	  }
	| {
			user: null;
			token: null;
	  };

interface AuthContextType {
	user: User | null;
	token: string | null;
	signIn: (username: string, password: string) => Promise<void>;
	signOut: () => void;
}

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: ParentProps) {
	const getInitialAuth = (): Auth => {
		try {
			const persistedAuth = localStorage.getItem("auth");
			return persistedAuth
				? JSON.parse(persistedAuth)
				: { user: null, token: null };
		} catch {
			return { user: null, token: null };
		}
	};

	const [auth, setAuth] = createStore<Auth>(getInitialAuth());

	createEffect(() => {
		localStorage.setItem("auth", JSON.stringify(auth));
		setAuthToken(auth.token);
	});

	async function signIn(username: string, password: string) {
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

	function signOut() {
		setAuth({
			user: null,
			token: null,
		});
	}

	return (
		<AuthContext.Provider
			value={{ user: auth.user, token: auth.token, signIn, signOut }}
		>
			{props.children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
