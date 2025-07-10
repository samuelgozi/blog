import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const envSchema = Type.Object({
	DB_FILE_NAME: Type.String(),
	AUTH_TOKEN_SECRET: Type.String(),
});

// Validate the environment variables against the schema.
// Exists the process if any of the environment variables are missing or malformed.
const errors = new Set<string>();

for (const error of Value.Errors(envSchema, process.env)) {
	const prop = error.path.substring(1);

	// Only log the first error for each property
	if (errors.has(prop)) continue;
	errors.add(prop);
}

if (errors.size) {
	throw Error(`Missing environment variables:\n${[...errors].join("\n")}`);
}

export const env = Value.Cast(envSchema, process.env);
