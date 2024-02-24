export type StaticPix = {
	payload: string;
	base64: string;
};

export type GeneratePixPort = {
	generate(
		value: number,
		endToEndId: string,
		message: string,
	): Promise<StaticPix>;
};
