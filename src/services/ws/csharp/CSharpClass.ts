import { CSharpProperty } from './CSharpProperty';
import { IBaseTypeToImportDescriptor } from '../commons';
import { ClassDeclaration, InterfaceDeclaration } from 'ts-morph';

export class CSharpClass {
    namespace: string;
    fileName: string;
    declaration: string;
    properties: CSharpProperty[] = [];

    constructor(namespace: string, descriptor: IBaseTypeToImportDescriptor) {
        this.namespace = namespace;
        this.declaration = descriptor.isClass
            ? this.getDeclarationFromClass(descriptor.declaration as ClassDeclaration)
            : this.getDeclarationFromInterface(descriptor.declaration as InterfaceDeclaration);
        this.properties = descriptor.isClass
            ? this.getPropertiesFromClass(descriptor.declaration as ClassDeclaration)
            : this.getPropertiesFromInterface(descriptor.declaration as InterfaceDeclaration)
        this.fileName = descriptor.declaration.getName();
    }
    private getDeclarationFromInterface(d: InterfaceDeclaration): string {
        const text = d.getName();
        return text;
    }
    private getDeclarationFromClass(d: ClassDeclaration): string {
        let text = d.getName();
        if (d.getBaseClass()) {
            text += ': ' + d.getBaseClass().getName();
        }
        return text;
    }
    private getPropertiesFromClass(d: ClassDeclaration) {
        const result = new Array<CSharpProperty>();
        d.getProperties().forEach(x => {
            if (!x.isReadonly() && !x.isStatic()) {
                result.push(new CSharpProperty(x));
            }
        });
        return result;
    }
    private getPropertiesFromInterface(d: InterfaceDeclaration) {
        const result = new Array<CSharpProperty>();
        d.getProperties().forEach(x => {
            if (!x.isReadonly()) {
                result.push(new CSharpProperty(x));
            }
        });
        return result;
    }

}
