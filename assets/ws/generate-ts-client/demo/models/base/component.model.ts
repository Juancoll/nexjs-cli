export abstract class ModelComponent {

    _type: string;

    data: any;

    constructor() {
        this._type = this.constructor.name;
    }
}
