import { Timestamp, ObjectID } from 'mongodb';

export interface IModelChangeEvent<T> {
    _id: any;
    operationType: string;
    clusterTime: Timestamp;
    fullDocument?: T;
    ns?: {
        db: string;
        coll: string;
    };
    documentKey?: {
        _id: ObjectID;
    };
}
