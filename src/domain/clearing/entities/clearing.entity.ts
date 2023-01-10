import { Entity, Props } from '../../common/entity';

export enum ClearingStatus {
  Empty = 1,
  Faulted = 2,
  RanToCompletion = 3,
}

export interface ClearingProps extends Props {
  length: number; // success = (totalElementos - invalid/dups)
  hash: string; // totalPaginas, totalElementos, ultimaPagina, primeiraPagina, tamanhoPagina, numeroDeElementos, target, offset
  target: string;
  offset: string;
  status: ClearingStatus;
  ids?: string[];
  endedAt?: Date;
  total?: number;
  remarks?: string;
}

export class Clearing extends Entity<ClearingProps> {
  getHash() {
    throw new Error('Method not implemented.');
  }
  constructor(props: ClearingProps, id?: string) {
    super(props, id);

    if (id) {
      return;
    }

    this.setStatus(ClearingStatus.Empty);
  }

  public setStatus(newStatus: ClearingStatus) {
    this.props.status = newStatus;
  }

  public getOffset(): string {
    return this.props.offset;
  }
}
