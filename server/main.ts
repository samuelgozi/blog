import { Elysia } from "elysia";
import { auth } from "./controllers/auth";
import { posts } from "./controllers/posts";
import { cors } from "./services/cors";
import { media } from "./controllers/media";

const app = new Elysia().use(cors).use(auth).use(posts).use(media).listen(8000);
export type App = typeof app;

console.log("Server is running on port 8000");
