import _ from 'lodash';
import moment from 'moment';
import { ModelComponent } from './component.model';

export class Model {

    //#region  [ properties ]

    _type: string;
    _id: any;

    enabled: boolean;

    createdAt: number;

    updatedAt: number;

    components: ModelComponent[] | null | undefined;
    //#endregion

    constructor(init?: Partial<Model>) {
        this._type = this.constructor.name;

        if (init) {
            Object.assign(this, init);
            if (init._id && typeof init._id == 'object') {
                this._id = this._id.toString();
            }
        } else {
            this.enabled = true;
            this.createdAt = moment().valueOf();
            this.updatedAt = moment().valueOf();
        }
    }

    //#region  [ public ]
    public update() {
        this.updatedAt = moment().valueOf();
    }
    //#endregions

    //#region [ Component methods ]
    public has<T extends ModelComponent>(type: new () => T): boolean {
        if (!this.components || this.components.length == 0) {
            return false;
        }
        return this.components.find(x => x._type == new type()._type) != undefined;
    }
    public get<T extends ModelComponent>(type: new () => T): T[] {
        if (!this.components || this.components.length == 0) {
            return [];
        }
        return this.components.filter(x => new type()._type) as T[];
    }
    public first<T extends ModelComponent>(type: new () => T): T | undefined {
        if (!this.components || this.components.length == 0) {
            return undefined;
        }
        return this.components.find(x => new type()._type) as T;
    }
    public add(component: ModelComponent) {
        if (!this.components) {
            this.components = [];
        }

        this.components.push(component);
    }
    public remove<T extends ModelComponent>(type: new () => T) {
        if (!this.components || this.components.length == 0) {
            throw new Error(`Components is empty`);
        }

        const first = this.first(type);
        if (!first) {
            throw new Error(`Component type ${new type()._type} not found`);
        }

        const idx = this.components.indexOf(first);
        this.components = this.components.splice(idx, 1);

        if (this.components.length == 0) {
            delete this.components;
        }
    }
    public removeAll<T extends ModelComponent>(type: new () => T) {
        if (!this.components || this.components.length == 0) {
            throw new Error(`Components is empty`);
        }

        const strType = new type()._type;
        this.components = _.remove(this.components, x => x._type == strType);

        if (this.components && this.components.length == 0) {
            delete this.components;
        }
    }
    //#endregion
}
