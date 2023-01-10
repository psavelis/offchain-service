import { OrderDto } from './order.dto';
export interface BrazilianPixOrderDto extends OrderDto {
  payload: string;
  base64: string;
}
