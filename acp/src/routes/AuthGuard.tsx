import { Route, useNavigate } from "@solidjs/router";
import { type ParentProps, Show } from "solid-js";
import { useAuth } from "../contexts/AuthContext";

interface AuthGuardProps extends ParentProps {
	require: "auth" | "guest";
	redirect: string;
}

export default function AuthGuard(guardProps: AuthGuardProps) {
	function AuthGuardComp(props: ParentProps) {
		const { user } = useAuth();
		const shouldPass = guardProps.require === "auth" ? user : !user;

		if (!shouldPass) {
			const navigate = useNavigate();
			navigate(guardProps.redirect);
		}

		return <Show when={shouldPass}>{props.children}</Show>;
	}

	return (
		<Route path="/" component={AuthGuardComp}>
			{guardProps.children}
		</Route>
	);
}
