import { Tokens } from "@mod/tokens";
import { env } from "./env";

export const tokens = new Tokens(env.AUTH_TOKEN_SECRET);
