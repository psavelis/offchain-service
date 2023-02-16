const isSequenceEntity = (v: any): v is SequenceEntity<any> => {
  return v instanceof SequenceEntity;
};

export interface Props {
  createdAt?: Date;
}

export abstract class SequenceEntity<T extends Props> {
  protected readonly _id: number;
  protected props: T;

  constructor(props: T, id?: number) {
    if (id) {
      this._id = id;
    }

    this.props = props;
    this.props.createdAt = props.createdAt ?? new Date();
  }

  public getId() {
    return this._id;
  }

  public equals(object?: SequenceEntity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isSequenceEntity(object)) {
      return false;
    }

    return this._id === object._id;
  }
}
