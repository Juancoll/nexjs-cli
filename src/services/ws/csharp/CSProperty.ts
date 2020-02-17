import {
    PropertyDeclaration,
    PropertySignature,
    ObjectLiteralExpression,
    StringLiteral,
    ObjectLiteralElement
} from 'ts-morph';
import { CSharpPropertyDecorator } from './decorators/CSPropertyDecorator';

export class CSharpProperty {
    //#region [ properties ]
    name: string;
    type: string;
    decorator: CSharpPropertyDecorator | undefined;
    //#endregion

    //#region [ constructor ]
    constructor(p: PropertyDeclaration | PropertySignature) {
        this.name = p.getName();
        if (p instanceof PropertyDeclaration) {
            this.decorator = this.getDecorator(p);
        }
        this.type = this.getType(p);
    }
    //#endregion

    //#region [ private ]
    private getType(p: PropertyDeclaration | PropertySignature): string {
        if (this.decorator) {
            return this.decorator.type;
        } else {
            let text = this.getTextWithoutImport(p.getType().getText());
            text = text.split('number').join('double');
            text = text.split('boolean').join('bool');
            return text;
        }
    }

    private getTextWithoutImport(text: string) {
        const result = text.split(/import\(\".*?\"\)\./).join('');
        return result;
    }

    private getDecorator(p: PropertyDeclaration): CSharpPropertyDecorator | undefined {
        const decorator = p.getDecorators().find(x => x.getName() == "CSProperty");
        if (!decorator) {
            return undefined;
        } else {
            const value = decorator.getArguments()[0] as ObjectLiteralExpression;
            return {
                type: this.getStringLiteral(value.getProperty('type'))
            };
        }
    }

    private getStringLiteral(literal: ObjectLiteralElement) {
        return (literal.getChildren()[2] as StringLiteral).getLiteralValue();
    }
    //#endregion
}
