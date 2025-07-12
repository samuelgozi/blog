import { Field } from "@ark-ui/solid/field";
import { PasswordInput } from "@ark-ui/solid/password-input";
import { useNavigate } from "@solidjs/router";
import { EyeIcon, EyeOffIcon } from "lucide-solid";
import { createSignal } from "solid-js";
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
				<Field.Root>
					<Field.Input
						placeholder="Username"
						value={username()}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<Field.ErrorText>Error Info</Field.ErrorText>
				</Field.Root>

				<PasswordInput.Root>
					<PasswordInput.Control>
						<PasswordInput.Input
							placeholder="password"
							value={password()}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<PasswordInput.VisibilityTrigger>
							<PasswordInput.Indicator fallback={<EyeOffIcon />}>
								<EyeIcon />
							</PasswordInput.Indicator>
						</PasswordInput.VisibilityTrigger>
					</PasswordInput.Control>
				</PasswordInput.Root>
				<button type="submit">Sign in</button>
			</form>
		</div>
	);
}
