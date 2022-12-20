export interface StaticPix {
  payload: string;
  base64: string;
}

export interface GeneratePixPort {
  generate(
    value: number,
    endToEndId: string,
    message: string,
  ): Promise<StaticPix>;
}
