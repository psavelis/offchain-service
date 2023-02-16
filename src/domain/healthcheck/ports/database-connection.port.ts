export interface DatabaseConnectionPort {
  check(): Promise<boolean>;
}
