import { PropertyDeclaration, PropertySignature } from 'ts-morph';

export class CSharpProperty {
    name: string;
    type: string;

    constructor(p: PropertyDeclaration | PropertySignature) {
        this.name = p.getName();
        this.type = this.getType(p);
    }

    getType(p: PropertyDeclaration): string {
        return this.getTextWithoutImport(p.getType().getText());
    }

    private getTextWithoutImport(text: string) {
        const result = text.split(/import\(\".*?\"\)\./).join('');
        return result;
    }
}
