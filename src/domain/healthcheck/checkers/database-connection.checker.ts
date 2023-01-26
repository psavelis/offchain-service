
export interface DatabaseConnectionChecker {
    check(): Promise<boolean>;
}
