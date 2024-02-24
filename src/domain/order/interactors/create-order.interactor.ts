import {type BrazilianPixOrderDto} from '../dtos/brazilian-pix-order.dto';
import {type CreateOrderDto} from '../dtos/create-order.dto';
import {type Order} from '../entities/order.entity';

export const CreateOrder = Symbol('CREATE_ORDER');

export type CreateOrderInteractor = {
	execute(entry: CreateOrderDto): Promise<Order | BrazilianPixOrderDto>;
};
