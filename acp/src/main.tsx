/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import Auth from "./routes/Auth";
import AuthGuard from "./routes/AuthGuard";
import Fallback from "./routes/Fallback";
import Home from "./routes/Home";

render(
	() => (
		<Router>
			<Route path="*" component={AuthGuard}>
				<Route path="/" component={Home} />
			</Route>
			<Route path="/auth" component={Auth} />
			<Route path="*" component={Fallback} />
		</Router>
	),
	document.getElementById("root")!,
);
