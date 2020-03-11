import { Collection } from 'mongodb';
import { SimpleEventDispatcher } from 'strongly-typed-events';

import { Model } from '@/models';
import { IModelChangeEvent } from './IModelChangeEvent';

export interface IModelProvider<TModel extends Model> {
    readonly collection: Collection<TModel>;

    onChange: SimpleEventDispatcher<IModelChangeEvent<TModel>>;

    create(model: TModel): Promise<TModel>;
    list(): Promise<TModel[]>;

    findById(id: string): Promise<TModel>;
    findOne(query: Partial<TModel>): Promise<TModel>;
    findMany(query: Partial<TModel>): Promise<TModel[]>;

    updateQuery(filter: Partial<TModel>, query: Partial<TModel>): Promise<number>;
    updateModel(model: TModel): Promise<TModel>;

    on(): void;
    off(): void;
}
