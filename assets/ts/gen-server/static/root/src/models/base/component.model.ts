import { CSProperty } from '@nexjs/wsserver';

export abstract class ModelComponent {
    _type: string;

    @CSProperty({ type: 'JToken' })
    data: any;

    constructor() {
        this._type = this.constructor.name;
    }
}
