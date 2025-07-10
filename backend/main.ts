import { Elysia } from "elysia";
import { auth } from "./controllers/auth";
import { posts } from "./controllers/posts";
import { cors } from "./services/cors";

new Elysia().use(cors).use(auth).use(posts).listen(8000);
console.log("Server is running on port 8000");
