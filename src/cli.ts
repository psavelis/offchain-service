import 'module-alias/register';
import * as cliAdapter from './application/cli';

const setupCliAdapter = () => {
  cliAdapter.bootstrap();
};

const initializeAdapters = () => {
  setupCliAdapter();
};

initializeAdapters();
