import {
	FileUpload,
	type FileUploadFileAcceptDetails,
} from "@ark-ui/solid/file-upload";
import { Show } from "solid-js";
import { app } from "~/services/app";
import { Button } from "./Button";
import styles from "./EditorPoster.module.css";

interface EditorPosterProps {
	poster?: string;
	onChange: (url: string) => void;
}

export function EditorPoster(props: EditorPosterProps) {
	function handleFileAccept(details: FileUploadFileAcceptDetails) {
		app.media
			.post({
				image: details.files[0],
			})
			.then((response) => {
				if (response.error) {
					console.error(response.error);
					return;
				}

				props.onChange(response.data);
			});
	}

	return (
		<Show
			when={!props.poster}
			fallback={
				<div class={styles.posterWrapper}>
					<img
						src={`http://localhost:8000/posters/${props.poster}.webp`}
						alt="Poster"
					/>
				</div>
			}
		>
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
		</Show>
	);
}
