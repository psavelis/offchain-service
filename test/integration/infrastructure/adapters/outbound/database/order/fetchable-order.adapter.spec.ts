import { FetchableOrderDbAdapter } from '../../../../../../../src/infrastructure/adapters/outbound/database/order/fetchable-order.adapter';
import { SettingsAdapter } from '../../../../../../../src/infrastructure/adapters/outbound/environment/settings.adapter';
import { Settings } from '../../../../../../../src/domain/common/settings';
import { KnexPostgresDatabase } from '../../../../../../../src/infrastructure/adapters/outbound/database/knex-postgres.db';

describe.skip('FetchOrderAdapter', () => {
  it('fetchManyByEndId', async () => {
    const settings: Settings = {
      price: {
        quoteExpirationSeconds: 60,
      },
    } as any;

    const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);

    const fetchOrderAdapter =
      FetchableOrderDbAdapter.getInstance(knexPostgresDb);

    const result = await fetchOrderAdapter.fetchManyByEndId([
      '6TUZA6EKXPP3GR6M092AAGCFA',
      '4Z8OFQEMP7WHG1FX0XBGDM39X',
      'ML879928GPEO91KHDZHGD7YW',
    ]);

    console.log(result);
  });
});
