/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agent } from 'https';
import fetch from 'node-fetch';
import { type Settings } from '../../../../../domain/common/settings';

const defaultHeaders = {
  Accept: 'application/json',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  'User-Agent': 'Kanna/1.0',
};

export class MBHttpClient {
  private static instance: MBHttpClient;
  private static token: string | undefined;
  private static expirationDate: Date | undefined;
  private readonly authEndpoint: string;
  private agent: fetch.Agent;

  private constructor(readonly settings: Settings) {
    const {
      host,
      endpoints: { authorize },
    } = this.settings.cex.mb;

    this.authEndpoint = new URL(authorize, host).toString();

    this.agent = new Agent({
      keepAlive: true,
      maxSockets: Infinity,
    });
  }

  static getInstance(settings: Settings) {
    if (!MBHttpClient.instance) {
      MBHttpClient.instance = new MBHttpClient(settings);
    }

    return MBHttpClient.instance;
  }

  async getToken() {
    if (
      MBHttpClient.token &&
      MBHttpClient.expirationDate &&
      MBHttpClient.expirationDate > new Date()
    ) {
      return MBHttpClient.token;
    }

    const { login, password } = this.settings.cex.mb;

    const payload = JSON.stringify({
      login,
      password,
    });

    const options = {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-Kanna-Request-Id': MBHttpClient.generateRequestId(),
      },
      agent: this.agent,
      body: payload,
    };

    let response: any;
    try {
      response = await fetch(this.authEndpoint, options);
    } catch (err) {
      this.agent = new Agent({
        keepAlive: true,
        maxSockets: Infinity,
      });

      options.headers['X-Kanna-Correlation-Id'] =
        options.headers['X-Kanna-Request-Id'];

      options.headers['X-Kanna-Request-Id'] = MBHttpClient.generateRequestId();
      response = await fetch(this.authEndpoint, options);
    }

    const tokenData = await response.json();

    MBHttpClient.token = tokenData.access_token;
    MBHttpClient.expirationDate = new Date(
      new Date().getTime() + (tokenData.expiration - 30) * 1000,
    );

    return MBHttpClient.token;
  }

  async get<T>(endpoint: string): Promise<T> {
    const token = await this.getToken();

    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
        ...defaultHeaders,
        'X-Kanna-Request-Id': MBHttpClient.generateRequestId(),
      },
    };

    let response: any;

    try {
      response = await fetch(endpoint, options);
    } catch (err: any) {
      this.agent = new Agent({
        keepAlive: true,
        maxSockets: Infinity,
      });

      options.headers['X-Kanna-Correlation-Id'] =
        options.headers['X-Kanna-Request-Id'];

      options.headers['X-Kanna-Request-Id'] = MBHttpClient.generateRequestId();
      response = await fetch(endpoint, options);
    }

    return response.json() as T;
  }

  static generateRequestId() {
    return (
      Math.random().toString(36).substring(2).toLocaleLowerCase() +
      Math.random().toString(36).substring(2).toUpperCase()
    );
  }
}
