import { ModelComponent } from './component.model';
import { CSProperty, IncludeMethod } from '@nexjs/wsserver';

export class Model {

    //#region  [ properties ]

    _type: string;

    @CSProperty({ type: 'string' })
    _id: any;

    enabled: boolean;
    @CSProperty({ type: 'long' })
    createdAt: number;

    @CSProperty({ type: 'long' })
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
            this.createdAt = new Date().valueOf();
            this.updatedAt = new Date().valueOf();
        }
    }

    //#region  [ public ]
    public update() {
        this.updatedAt = new Date().valueOf();
    }
    //#endregion

    //#region [ Component methods ]
    @IncludeMethod()
    public has<T extends ModelComponent>(type: new () => T): boolean {
        if (!this.components || this.components.length == 0) {
            return false;
        }
        return this.components.find(x => x._type == new type()._type) != undefined;
    }
    @IncludeMethod()
    public get<T extends ModelComponent>(type: new () => T): T[] {
        if (!this.components || this.components.length == 0) {
            return [];
        }
        return this.components.filter(x => x._type == new type()._type) as T[];
    }
    @IncludeMethod()
    public first<T extends ModelComponent>(type: new () => T): T | undefined {
        if (!this.components || this.components.length == 0) {
            return undefined;
        }
        return this.components.find(x => x._type == new type()._type) as T;
    }
    @IncludeMethod()
    public add(component: ModelComponent) {
        if (!this.components) {
            this.components = [];
        }

        this.components.push(component);
    }
    @IncludeMethod()
    public remove<T extends ModelComponent>(type: new () => T) {
        if (!this.components || this.components.length == 0) {
            throw new Error(`Components is empty`);
        }

        const first = this.first(type);
        if (!first) {
            throw new Error(`Component type ${new type()._type} not found`);
        }

        const idx = this.components.indexOf(first);
        this.components.splice(idx, 1);

        if (this.components.length == 0) {
            delete this.components;
        }
    }
    @IncludeMethod()
    public removeAll<T extends ModelComponent>(type: new () => T) {
        if (!this.components || this.components.length == 0) {
            throw new Error(`Components is empty`);
        }

        const strType = new type()._type;
        this.components = this.components.filter(x => x._type != strType);

        if (this.components && this.components.length == 0) {
            delete this.components;
        }
    }
    @IncludeMethod()
    public clear() {
        this.components = [];
    }
    //#endregion
}
