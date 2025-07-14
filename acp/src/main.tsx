/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastsContext";
import Auth from "./routes/Auth";
import AuthGuard from "./routes/AuthGuard";
import Editor from "./routes/Editor";
import Fallback from "./routes/Fallback";
import Home from "./routes/Home";

render(
	() => (
		<AuthProvider>
			<ToastProvider>
				<Router>
					<AuthGuard require="auth" redirect="/auth">
						<Route path="/" component={Home} />
						<Route path="/editor/:id" component={Editor} />
					</AuthGuard>
					<AuthGuard require="guest" redirect="/">
						<Route path="/auth" component={Auth} />
					</AuthGuard>
					<Route path="*" component={Fallback} />
				</Router>
			</ToastProvider>
		</AuthProvider>
	),
	document.getElementById("root")!,
);
