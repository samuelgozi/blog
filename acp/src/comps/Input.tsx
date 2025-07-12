import { PasswordInput } from "@ark-ui/solid";
import {
	Field as BaseField,
	type FieldInputProps as BaseFieldInputProps,
} from "@ark-ui/solid/field";
import { EyeIcon, EyeOffIcon } from "lucide-solid";
import { splitProps } from "solid-js";
import { mergeClasses } from "~/utils/solid";
import styles from "./Input.module.css";

interface InputProps extends BaseFieldInputProps {}

export function Input(props: InputProps) {
	const [p, rest] = splitProps(props, ["class"]);
	const classes = mergeClasses(styles.input, p.class);

	if (rest.type === "password")
		return (
			<PasswordInput.Root>
				<PasswordInput.Control>
					<PasswordInput.Input class={classes} {...rest} />
					<PasswordInput.VisibilityTrigger>
						<PasswordInput.Indicator fallback={<EyeOffIcon />}>
							<EyeIcon />
						</PasswordInput.Indicator>
					</PasswordInput.VisibilityTrigger>
				</PasswordInput.Control>
			</PasswordInput.Root>
		);

	return (
		<BaseField.Root>
			<BaseField.Input class={classes} {...rest} />
		</BaseField.Root>
	);
}
