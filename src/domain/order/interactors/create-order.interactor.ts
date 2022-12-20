import { BrazilianPixOrderDto } from '../dtos/brazilian-pix-order.dto';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from '../entities/order.entity';

export const CreateOrder = Symbol('CREATE_ORDER');

export interface CreateOrderInteractor {
  execute(entry: CreateOrderDto): Promise<Order | BrazilianPixOrderDto>;
}
