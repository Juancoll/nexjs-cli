import { CSharpProperty } from './CSharpProperty';
import { IBaseTypeToImportDescriptor } from '../commons';
import { ClassDeclaration, InterfaceDeclaration, ObjectLiteralExpression, ObjectLiteralElement, StringLiteral } from 'ts-morph';

interface CSharpClassDecorator {
    base: string;
}

export class CSharpClass {
    //#region [ properties ]
    namespace: string;
    fileName: string;
    declaration: string;
    properties: CSharpProperty[] = [];
    decorator: CSharpClassDecorator | undefined
    //#endregion

    //#region [ constructor ]
    constructor(namespace: string, descriptor: IBaseTypeToImportDescriptor) {
        this.namespace = namespace;
        this.decorator = descriptor.isClass
            ? this.getDecorator(descriptor.declaration as ClassDeclaration)
            : undefined;
        this.declaration = descriptor.isClass
            ? this.getDeclarationFromClass(descriptor.declaration as ClassDeclaration)
            : this.getDeclarationFromInterface(descriptor.declaration as InterfaceDeclaration);
        this.properties = descriptor.isClass
            ? this.getPropertiesFromClass(descriptor.declaration as ClassDeclaration)
            : this.getPropertiesFromInterface(descriptor.declaration as InterfaceDeclaration)
        this.fileName = descriptor.declaration.getName();
    }
    //#endregion

    //#region [ private ]
    private getDeclarationFromInterface(d: InterfaceDeclaration): string {
        const text = d.getName();
        return text;
    }
    private getDeclarationFromClass(d: ClassDeclaration): string {
        let text = d.getName();
        if (this.decorator) {
            text += ': ' + this.decorator.base;
        } else if (d.getBaseClass()) {
            text += ': ' + d.getBaseClass().getName();
        } else {
            const parameters = d.getTypeParameters();
            if (parameters.length > 0) {
                text += `<${parameters.map(x => x.getText()).join(',')}>`;
            }
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
    private getDecorator(p: ClassDeclaration): CSharpClassDecorator | undefined {
        const decorator = p.getDecorators().find(x => x.getName() == "CSClass");
        if (!decorator) {
            return undefined;
        } else {
            const value = decorator.getArguments()[0] as ObjectLiteralExpression;
            return {
                base: this.getStringLiteral(value.getProperty('base'))
            };
        }
    }
    private getStringLiteral(literal: ObjectLiteralElement) {
        return (literal.getChildren()[2] as StringLiteral).getLiteralValue();
    }
    //#endregion
}
