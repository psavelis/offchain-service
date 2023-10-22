import { EstimateDelegateOrderDto } from '../dtos/estimate-delegate-order.dto';

export interface EstimateDelegateOrderPort {
  execute(payload: EstimateDelegateOrderDto): Promise<string>;
}
