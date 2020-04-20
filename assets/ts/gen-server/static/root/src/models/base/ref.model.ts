import { CSProperty } from '@nexjs/wsserver';

export class ModelRef {
    info: string;

    @CSProperty({ type: 'string' })
    modelId: any;
}

// tslint:disable-next-line: max-classes-per-file
export class DataModelRef<TData> {
    @CSProperty({ type: 'string' })
    modelId: any;

    info: string;
    data?: TData;
}
