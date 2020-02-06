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
export declare class TypeDescriptor implements ITypeDescriptor {
    readonly tsType: Type;
    readonly isArray: boolean;
    readonly import: ITypeImportDescriptor;
    readonly strType: string;
    get requireImport(): boolean;
    constructor(type: Type);
    private extractImportDescriptor;
    private extractStringType;
}
