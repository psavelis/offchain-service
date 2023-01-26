import { CommandFactory } from 'nest-commander';
import { CliModule } from "./modules/cli/cli.module";

export async function bootstrap() {
    await CommandFactory.run(CliModule);
}
