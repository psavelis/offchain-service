export interface FetchableSupplyPort {
  fetch(): Promise<string>;
}
