/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import { AuthProvider } from "./contexts/AuthContext";
import Auth from "./routes/Auth";
import AuthGuard from "./routes/AuthGuard";
import Fallback from "./routes/Fallback";
import Home from "./routes/Home";

render(
	() => (
		<AuthProvider>
			<Router>
				<AuthGuard require="auth" redirect="/auth">
					<Route path="/" component={Home} />
				</AuthGuard>
				<AuthGuard require="guest" redirect="/">
					<Route path="/auth" component={Auth} />
				</AuthGuard>
				<Route path="*" component={Fallback} />
			</Router>
		</AuthProvider>
	),
	document.getElementById("root")!,
);
