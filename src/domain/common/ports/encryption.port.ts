export type EncryptionPort = {
	encrypt(
		content: string,
		initializationVector: string,
		secret: string,
	): Promise<string>;

	decrypt(
		content: string,
		initializationVector: string,
		secret: string,
	): Promise<string>;
};
