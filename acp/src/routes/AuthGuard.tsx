import { useNavigate } from "@solidjs/router";
import { type ParentProps, Show } from "solid-js";

export default function AuthGuard(props: ParentProps) {
	const navigate = useNavigate();
	const user = true;
	if (!user) navigate("/auth");
	return <Show when={user}>{props.children}</Show>;
}
