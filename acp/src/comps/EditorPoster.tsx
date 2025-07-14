import {
	FileUpload,
	type FileUploadFileAcceptDetails,
} from "@ark-ui/solid/file-upload";
import { Button } from "./Button";
import styles from "./EditorPoster.module.css";

export function EditorPoster() {
	function handleFileAccept(details: FileUploadFileAcceptDetails) {
		console.log(details);
	}

	return (
		<FileUpload.Root
			class={styles.root}
			maxFiles={1}
			accept="image/jpeg"
			onFileAccept={handleFileAccept}
		>
			<FileUpload.Dropzone class={styles.dropzone}>
				<FileUpload.Label class={styles.label}>
					Drop your poster image here
				</FileUpload.Label>
				<FileUpload.Trigger asChild={(props) => <Button {...props()} />}>
					Select Image
				</FileUpload.Trigger>
			</FileUpload.Dropzone>
			<FileUpload.HiddenInput />
		</FileUpload.Root>
	);
}
