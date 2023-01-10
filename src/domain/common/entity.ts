import { Id } from './uuid';

const isEntity = (v: any): v is Entity<any> => {
  return v instanceof Entity;
};

export type UniqueEntityUUID = string;

export interface Props {
  createdAt?: Date;
}

export abstract class Entity<T extends Props> {
  protected readonly _id: UniqueEntityUUID;
  protected props: T;

  constructor(props: T, id?: UniqueEntityUUID) {
    this._id = id ?? Id.createUnique();
    this.props = props;
    this.props.createdAt = props.createdAt ?? new Date();
  }

  public getId() {
    return this._id;
  }

  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this._id === object._id;
  }
}
