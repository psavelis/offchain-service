import {type EstimateDelegateOrderDto} from '../dtos/estimate-delegate-order.dto';

export type EstimateDelegateOrderPort = {
	execute(payload: EstimateDelegateOrderDto): Promise<string>;
};
