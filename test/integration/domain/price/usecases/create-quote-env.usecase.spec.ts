import { NetworkType } from '../../../../../src/domain/common/enums/network-type.enum';
import { CreateOrderInteractor } from '../../../../../src/domain/order/interactors/create-order.interactor';
import { CreateOrderFactory } from '../../../../../src/infrastructure/factories/order/create-order.factory';
import { CreateOrderDto } from '../../../../../src/domain/order/dtos/create-order.dto';
import { BrazilianPixOrderDto } from '../../../../../src/domain/order/dtos/brazilian-pix-order.dto';
import { PaymentOption } from '../../../../../src/domain/order/entities/order.entity';
import { config } from 'dotenv';

jest.setTimeout(90000);
describe.skip('CreateQuoteUseCase', () => {
  let createQuoteUseCase: CreateOrderInteractor;
  beforeAll(() => {
    config();
    process.env.NODE_ENV = 'production';
    createQuoteUseCase = CreateOrderFactory.getInstance();
  });

  it.skip('should calculate a given USD amount', async () => {
    const payload: CreateOrderDto = {
      amount: {
        unassignedNumber: '10000',
        decimals: 2,
        isoCode: 'BRL',
      },
      userIdentifier: 'teste@gmail.com',
      identifierType: 'EA',
      clientAgent: 'Mozilla/5.0',
      clientIp: '',
      chainId: NetworkType.Ethereum,
      paymentOption: PaymentOption.BrazilianPix,
    };

    const order: BrazilianPixOrderDto = (await createQuoteUseCase.execute(
      payload,
    )) as BrazilianPixOrderDto;

    expect(order.statusDescription).toEqual('Aguardando Pagamento');
  });
});
