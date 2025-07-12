import {
	type Accessor,
	createContext,
	createEffect,
	createSignal,
	type ParentProps,
	useContext,
} from "solid-js";
import { app, setClientToken } from "../services/app";

interface User {
	id: string;
	username: string;
	updatedAt: Date;
	createdAt: Date;
}

interface AuthContextType {
	user: Accessor<User | null>;
	token: Accessor<string | null>;
	signIn: (username: string, password: string) => Promise<void>;
	signOut: () => void;
}

const AuthContext = createContext<AuthContextType>();

function getInitialAuth() {
	try {
		const persistedAuth = localStorage.getItem("auth");
		return persistedAuth
			? JSON.parse(persistedAuth)
			: { user: null, token: null };
	} catch {
		return { user: null, token: null };
	}
}

export function AuthProvider(props: ParentProps) {
	const initial = getInitialAuth();
	const [user, setUser] = createSignal<User | null>(initial.user);
	const [token, setToken] = createSignal<string | null>(initial.token);

	createEffect(() => {
		localStorage.setItem(
			"auth",
			JSON.stringify({
				user: user(),
				token: token(),
			}),
		);
		setClientToken(token());
	});

	async function signIn(username: string, password: string) {
		const response = await app.auth.post({ username, password });
		if (response.error) throw response.error.value;

		setUser({
			id: response.data.user.id,
			username: response.data.user.username,
			updatedAt: new Date(response.data.user.updatedAt),
			createdAt: new Date(response.data.user.createdAt),
		});

		setToken(response.data.token);
		setClientToken(response.data.token);
	}

	function signOut() {
		setUser(null);
		setToken(null);
		setClientToken(null);
	}

	return (
		<AuthContext.Provider value={{ user, token, signIn, signOut }}>
			{props.children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within an AuthProvider");
	return context;
}
