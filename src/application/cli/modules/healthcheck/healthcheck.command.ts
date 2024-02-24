import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'healthcheck', description: 'Run Healthcheck routine' })
export class HealthcheckCommand extends CommandRunner {
  async run(): Promise<void> {
    const apiHost = process.env.API_HOST;
    const apiPort = process.env.API_PORT;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000);

    try {
      const response = await fetch(
        `http://${apiHost}:${apiPort}/v2/healthcheck`,
        {
          signal: abortController.signal,
        },
      );

      clearTimeout(timeoutId);

      if (response.status !== 200) {
        throw new Error('Unhealthy');
      }
      console.log('Healthcheck passed');
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Healthcheck failed: Request timed out');
      } else {
        throw new Error('Healthcheck failed: ' + error.message);
      }
    }
  }
}
