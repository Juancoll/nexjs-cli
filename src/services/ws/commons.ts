import { SourceFile, ClassDeclaration, InterfaceDeclaration } from 'ts-morph';
import { BaseType } from './Models/BaseType';

export interface IServiceName {
    name: string;
    upper: string;
}

export interface IBaseTypeToImportDescriptor {
    baseType: BaseType;
    file: SourceFile;
    isClass: boolean;
    isInterface: boolean;
    name: string;
    declaration: ClassDeclaration | InterfaceDeclaration;
}
