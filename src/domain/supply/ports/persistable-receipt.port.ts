import {type Receipt} from '../entities/receipt.entity';

export type PersistableReceiptPort = {
	create(receipt: Receipt): Promise<Receipt>;
};
