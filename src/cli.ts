import 'module-alias/register'; // TODO: ajustar aliases
import * as cliAdapter from './infrastructure/adapters/inbound/cli';

const setupCliAdapter = () => {
  cliAdapter.bootstrap();
};

const initializeAdapters = () => {
  setupCliAdapter();
};

initializeAdapters();
