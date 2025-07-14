import {
	type CreateToasterReturn,
	createToaster,
	Toast,
	Toaster,
} from "@ark-ui/solid/toast";
import { X } from "lucide-solid";
import { createContext, type ParentProps, useContext } from "solid-js";
import { Portal } from "solid-js/web";

const ToastContext = createContext<CreateToasterReturn>();

export function ToastProvider(props: ParentProps) {
	const toaster = createToaster({
		placement: "top-end",
		gap: 24,
	});

	return (
		<ToastContext.Provider value={toaster}>
			<Portal>
				<Toaster toaster={toaster}>
					{(toast) => (
						<Toast.Root>
							<Toast.Title>{toast().title}</Toast.Title>
							<Toast.Description>{toast().description}</Toast.Description>
							<Toast.CloseTrigger>
								<X />
							</Toast.CloseTrigger>
						</Toast.Root>
					)}
				</Toaster>
			</Portal>
			{props.children}
		</ToastContext.Provider>
	);
}

export function useToaster() {
	const context = useContext(ToastContext);
	if (!context)
		throw new Error("useToaster must be used within a ToastProvider");
	return context;
}
