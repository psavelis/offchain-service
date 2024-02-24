import {type Order} from '../entities/order.entity';

export type EndToEndId = string;
export type OrderDictionary = Record<EndToEndId, Order>;
