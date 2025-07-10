import { TokenError } from "./errors.ts";
import { decryptData, encryptData, keyFromBase64 } from "./utils.ts";

interface TokenBase {
	iat: number;
	exp: number;
}

export interface UserToken extends TokenBase {
	user: string;
}

export interface ServiceAccountToken extends TokenBase {
	service: string;
}

export type UserTokenParams = Omit<UserToken, keyof TokenBase>;
export type ServiceAccountTokenParams = Omit<ServiceAccountToken, keyof TokenBase>;

export class Tokens {
	private key: Promise<CryptoKey>;

	constructor(key: string) {
		this.key = keyFromBase64(key);
	}

	/**
	 * Encrypt a token object into a base64url token
	 */
	async encrypt(obj: UserTokenParams | ServiceAccountTokenParams) {
		const { encryptedData, iv } = await encryptData(await this.key, {
			...obj,
			iat: Date.now(),
			exp: Date.now() + 60 * 60 * 1000,
		});

		try {
			// User tokens are prefixed with "uv1" -> User Version 1
			return `v1.${Buffer.from(iv).toString("base64url")}.${Buffer.from(encryptedData).toString("base64url")}`;
		} catch (error: any) {
			// This error is thrown when the key or algorithm
			// used to encrypt the token is invalid.
			// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#invalidaccesserror
			if (error?.name === "InvalidAccessError")
				throw new TokenError("Token encryption failed due to invalid key or algorithm");

			// Re-throw the error if it's not one of the above.
			throw error;
		}
	}

	/**
	 * Decrypt a base64url token into a token object
	 */
	async decrypt(token: string) {
		const parts = token.match(/^(?<version>\w+)\.(?<iv>\w+)\.(?<payload>[\w-]+)$/)?.groups;
		if (!parts || parts.version !== "v1") return null;

		try {
			return await decryptData<ServiceAccountToken | UserToken>(
				await this.key,
				Buffer.from(parts.payload!, "base64url"),
				Buffer.from(parts.iv!, "base64url"),
			);
		} catch (error: any) {
			// This error is thrown when the token is invalid.
			// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#operationerror
			if (error?.name === "OperationError") return null;

			// This error is thrown when the key or algorithm
			// used to decrypt the token is invalid.
			// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#invalidaccesserror
			if (error?.name === "InvalidAccessError")
				throw new TokenError("Token parsing failed due to invalid key or algorithm");

			// Re-throw the error if it's not one of the above.
			throw error;
		}
	}
}
