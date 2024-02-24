import 'module-alias/register'; // TODO: ajustar aliases
import * as apiAdapter from './application/api';

const setupApiAdapter = () => {
  const apiHost = process.env.API_HOST;
  const apiEntrypoint = 'v2'; // process.env.API_ENTRYPOINT!;
  const apiPort = parseInt(process.env.API_PORT, 10);

  apiAdapter.bootstrap(apiHost, apiEntrypoint, apiPort);
};

const initializeAdapters = () => {
  setupApiAdapter();
};

initializeAdapters();
