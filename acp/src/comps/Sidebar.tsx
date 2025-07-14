import { useNavigate } from "@solidjs/router";
import { app } from "~/services/app";
import { Button } from "./Button";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
	const navigate = useNavigate();

	function handleNavigate() {
		app.posts.post({}).then((resp) => {
			if (resp.error) {
				console.error(resp.error);
				return;
			}

			navigate(`/editor/${resp.data.post.id}`);
		});
	}

	return (
		<div class={styles.sidebar}>
			<h2>Admin Control Panel</h2>
			<Button class={styles.newBlogButton} size="xs" onClick={handleNavigate}>
				Create New Post
			</Button>
		</div>
	);
}
