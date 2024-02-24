import {type OrderDto} from './order.dto';
export type BrazilianPixOrderDto = {
	payload: string;
	base64: string;
} & OrderDto;
