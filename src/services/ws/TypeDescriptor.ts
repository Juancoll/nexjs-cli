import { Type } from 'ts-morph';

export interface ITypeImportDescriptor {
    strType: string;
    sourcePath: string;
    targetPath?: string;
}

export interface ITypeDescriptor {
    readonly tsType: Type;
    isArray: boolean;
    strType: string;
    import?: ITypeImportDescriptor;
}
export class TypeDescriptor implements ITypeDescriptor {

    //#region [ ITypeDescriptor ]
    public readonly tsType: Type;
    public readonly isArray: boolean;
    public readonly import: ITypeImportDescriptor;
    public readonly strType: string;
    //#endregion

    //#region [ properties ]
    public get requireImport() {
        return this.tsType.getText().indexOf('import("') > -1;
    }
    //#endregion

    //#region [ construtor ]
    constructor(type: Type) {
        this.tsType = type;
        this.isArray = type.isArray();
        this.import = this.extractImportDescriptor(type);
        this.strType = this.extractStringType(type);
    }
    //#endregion

    //#region [ private ]
    private extractImportDescriptor(type: Type): ITypeImportDescriptor | undefined {
        if (!this.requireImport) {
            return undefined;
        } else {
            const text = type.getText();
            const idxFirst = text.lastIndexOf('("');
            const idxLast = text.lastIndexOf('")');
            return {
                strType: type.isArray()
                    ? this.extractImportDescriptor(type.getArrayElementType()).strType
                    : text.substr(idxLast + 3),
                sourcePath: text.substr(idxFirst + 2, idxLast - idxFirst - 2),
            } as ITypeImportDescriptor;
        }
    }
    private extractStringType(type: Type): string {
        if (!this.requireImport) {
            return type.getText();
        } else {
            const text = type.getText();
            const idxLast = text.lastIndexOf('")');
            return text.substr(idxLast + 3);
        }
    }
    //#endregion
}