import { RType } from './RType';

export class RDependencies {
    private _types: RType[] = [];

    addType(value: RType) {
        if (value && !value.isPrimitive) {
            if (!this._types.find(x => value.name == x.name && value.sourceFile == x.sourceFile)) {
                if (!value.isArray)
                    this._types.push(value);
                this.addTypes(value.getDependencies());
            }
        }
    }
    addTypes(values: RType[]) {
        values.forEach(x => this.addType(x));
    }

    get() {
        return this._types;
    }
}