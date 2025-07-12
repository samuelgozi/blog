import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { Button } from "~/comps/Button";
import { Input } from "~/comps/Input";
import { useAuth } from "~/contexts/AuthContext";
import styles from "./Auth.module.css";

export default function Auth() {
	const [username, setUsername] = createSignal("");
	const [password, setPassword] = createSignal("");
	const { signIn } = useAuth();
	const navigate = useNavigate();

	async function handleSubmit(e: Event) {
		e.preventDefault();
		await signIn(username(), password());
		navigate("/");
	}

	return (
		<div class={styles.container}>
			<form onSubmit={handleSubmit}>
				<Input
					placeholder="Username"
					value={username()}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<Input
					type="password"
					placeholder="password"
					value={password()}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<Button type="submit">Sign in</Button>
			</form>
		</div>
	);
}
