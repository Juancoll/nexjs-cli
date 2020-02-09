import { Type } from 'ts-morph';

export enum BaseTypePrimitive {
    any = 'any',
    string = 'string',
    number = 'number',
    boolean = 'boolean',
    method = 'method',

    null = 'null',
    undefined = 'undefined',
    unknown = 'unknown',

    array = 'array',
    class = 'class',
    interface = 'interface',
    enum = 'enum',
    tuple = 'tuple',
    object = 'object',
}
// tslint:disable-next-line: max-classes-per-file
export class BaseType {

    //#region [ static ]
    public static importEquals(a: BaseType, b: BaseType) {
        if (!a.importFile || !b.importFile) {
            return false;
        }
        if (a.importFile != b.importFile) {
            return false;
        }
        if (a.textType != b.textType) {
            return false;
        }
        return true;
    }
    public static getTypesToImports(...args: BaseType[]) {
        const result = new Array<BaseType>();
        args.forEach(arg => {
            const toImport = arg.getAllImports();
            toImport.forEach(type => {
                if (!result.find(x => BaseType.importEquals(x, type))) {
                    result.push(type);
                }
            });
        });
        return result;
    }
    //#endregion

    //#region [ properties ]
    text: string;
    textWihoutImports: string;
    textType: string;
    importFile?: string;
    primitive: BaseTypePrimitive;
    details: {
        isClassOrInterface: boolean;
        isLiteral: boolean;
        isNullable: boolean;
        isAnonymous: boolean;
        isEnumLiteral: boolean;
        isIntersection: boolean;
        isStringLiteral: boolean;
        isTypeParameter: boolean;
        isUnion: boolean;
        isUnionOrIntersection: boolean;
    };
    baseTypes: BaseType[];
    arguments: BaseType[];
    properties: { [name: string]: BaseType };
    methods: { [name: string]: BaseType };
    //#endregion

    //#region [ constructor ]
    constructor(t: Type) {
        this.primitive = this.getPrimitive(t);
        this.importFile = this.getImport(t);
        this.details = {
            isAnonymous: t.isAnonymous(),
            isClassOrInterface: t.isClassOrInterface(),
            isEnumLiteral: t.isEnumLiteral(),
            isIntersection: t.isIntersection(),
            isLiteral: t.isLiteral(),
            isNullable: t.isNullable(),
            isStringLiteral: t.isStringLiteral(),
            isTypeParameter: t.isTypeParameter(),
            isUnion: t.isUnion(),
            isUnionOrIntersection: t.isUnionOrIntersection(),
        };
        this.baseTypes = t.getBaseTypes().map(x => new BaseType(x));
        this.arguments = t.getTypeArguments().map(x => new BaseType(x));

        const properties = t.getProperties().filter(x => !x.getDeclarations()[0].getType().isAnonymous());
        this.properties = this.arrayToObject(properties, item => item.getName(), item => new BaseType(item.getDeclarations()[0].getType()));

        const methods = t.getProperties().filter(x => x.getDeclarations()[0].getType().isAnonymous());
        this.methods = this.arrayToObject(methods, item => item.getName(), item => new BaseType(item.getDeclarations()[0].getType()));

        this.text = t.getText();
        this.textWihoutImports = this.getTextWithoutImport(t);
        this.textType = this.getTextype(t);

        this.filterPropertiesByBaseType();
        this.filterMethodsByBaseType();
    }
    //#endregion

    //#region [ public ]
    public getAllImports(): BaseType[] {
        if (this.textWihoutImports == 'IModelRef<void>') {
            const a = 0;
        }
        let result = new Array<BaseType>();
        if (!this.importFile) {
            return [];
        }
        if (this.importFile && this.primitive != BaseTypePrimitive.array) {
            result.push(this);
        }
        this.baseTypes.forEach(x => { result = result.concat(x.getAllImports()); });
        this.arguments.forEach(x => { result = result.concat(x.getAllImports()); });
        for (const key in this.properties) {
            if (key) {
                this.properties[key].getAllImports().forEach(type => {
                    if (!result.find(x => BaseType.importEquals(x, type))) {
                        result.push(type);
                    }
                });
            }
        }
        return result;
    }
    toString() {
        return `primitive: ${this.primitive}, text: ${this.text}`;
    }
    //#endregion

    //#region [ private ]
    private arrayToObject<T>(array: T[], key: (item: T) => string, value: (item: T) => any) {
        return array.reduce((obj, item) => {
            const k = key(item);
            const v = value(item);
            obj[k] = v;
            return obj;
        }, {});
    }

    private isImport(t: Type) {
        return t.getText().startsWith('import("');
    }
    private getTextWithoutImport(t: Type) {
        const text = t.getText();
        const result = text.split(/import\(\".*?\"\)\./).join('');
        return result;
    }
    private getTextype(t: Type): string {
        let str = this.textWihoutImports;
        if (t.isArray()) {
            if (str.endsWith('[]')) {
                str = str.substr(0, str.length - 2);
            }
            if (str.startsWith('Array<')) {
                str = str.substr(6, str.length - 6 - 1);
            }
        } else if (this.arguments.length > 0) {
            const idxStart = str.indexOf('<');
            str = str.substr(0, idxStart);
        }
        return str;
    }

    private getImport(t: Type): string | undefined {
        if (!this.isImport(t)) {
            return undefined;
        } else {
            const withQuotes = t.getText().match(/\".*?\"/)[0];
            return withQuotes.split('"').join('');
        }
    }
    private getPrimitive(t: Type): BaseTypePrimitive {
        if (t.isAny()) { return BaseTypePrimitive.any; }
        if (t.isString()) { return BaseTypePrimitive.string; }
        if (t.isNumber()) { return BaseTypePrimitive.number; }
        if (t.isBoolean()) { return BaseTypePrimitive.boolean; }
        if (t.isAnonymous()) { return BaseTypePrimitive.method; }

        if (t.isNull()) { return BaseTypePrimitive.null; }
        if (t.isUndefined()) { return BaseTypePrimitive.undefined; }
        if (t.isUnknown()) { return BaseTypePrimitive.unknown; }

        if (t.isArray()) { return BaseTypePrimitive.array; }
        if (t.isClass()) { return BaseTypePrimitive.class; }
        if (t.isInterface()) { return BaseTypePrimitive.interface; }
        if (t.isEnum()) { return BaseTypePrimitive.enum; }
        if (t.isTuple()) { return BaseTypePrimitive.tuple; }
        if (t.isObject()) { return BaseTypePrimitive.object; }
    }
    private filterPropertiesByBaseType() {
        this.baseTypes.forEach(base => {
            const names = Object.keys(base.properties);
            for (const key in this.properties) {
                if (key && names.indexOf(key) > -1) {
                    delete this.properties[key];
                }
            }
        });
    }
    private filterMethodsByBaseType() {
        this.baseTypes.forEach(x => {
            const names = Object.keys(x.methods);
            for (const key in this.methods) {
                if (key && names.indexOf(key) > -1) {
                    delete this.methods[key];
                }
            }
        });
    }
    //#endregion
}
