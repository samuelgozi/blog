import { Toast as BaseToast } from "@ark-ui/solid";
import { X } from "lucide-solid";
import styles from "./Toast.module.css";

interface ToastProps {
	title: JSX.Element;
	description: JSX.Element;
}

export function Toast(props: ToastProps) {
	return (
		<BaseToast.Root class={styles.toast}>
			<BaseToast.Title>{props.title}</BaseToast.Title>
			<BaseToast.Description>{props.description}</BaseToast.Description>
			<BaseToast.CloseTrigger>
				<X />
			</BaseToast.CloseTrigger>
		</BaseToast.Root>
	);
}
