import { Command, CommandRunner } from 'nest-commander';
import http from 'http';

@Command({ name: 'healthcheck', description: 'Run Healthcheck routine' })
export class HealthcheckCommand extends CommandRunner {
  async run(
    passedParams: string[],
    options?: Record<string, any> | undefined,
  ): Promise<void> {
    const apiHost = process.env.API_HOST!;
    const apiPort = parseInt(process.env.API_PORT!, 10);

    const statusCode = await new Promise((resolve, reject) => {
      const req = http.get(
        {
          host: apiHost,
          port: apiPort,
          path: '/v1/purchases/healthcheck',
        },
        (res) => resolve(res.statusCode),
      );

      req.setTimeout(1000 * 10);

      req.on('timeout', () => {
        req.destroy(new Error('Request timeout'));
      });

      req.end();
    });

    if (statusCode !== 200) {
      throw new Error('Unhealthy');
    }
  }
}
