export const GenerateFingerprint = Symbol('GENERATE_FINGERPRINT');
export type GenerateFingerprintInteractor = {
  execute(): Promise<void>;
};
