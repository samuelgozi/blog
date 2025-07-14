import Sidebar from "~/comps/Sidebar";
import Split from "~/comps/Split";
import styles from "./Home.module.css";

export default function Home() {
	return (
		<Split.Horizontal
			class={styles.splitContainer}
			defaultSize="250px"
			right={"Main content"}
			left={<Sidebar />}
		/>
	);
}
