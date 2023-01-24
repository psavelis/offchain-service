import { Receipt } from '../entities/receipt.entity';

export interface PersistableReceiptPort {
  create(receipt: Receipt): Promise<Receipt>;
}
