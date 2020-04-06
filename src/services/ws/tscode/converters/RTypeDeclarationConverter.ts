import { CodeConverterBase } from '../base/CodeConverterBase';
import { RTypeDeclaration } from '../../models/base/RTypeDeclaration';
import { TSCode } from '../TSCode';
import { ClassDeclaration, InterfaceDeclaration, PropertySignature, PropertyDeclaration, ObjectLiteralExpression } from 'ts-morph';
import { RDecorator } from '../../models/base/RDecorator';

export class RTypeDeclarationInput {
    isInterface: boolean;
    name: string;
    sourceFile: string;
}

export class RTypeDeclarationConverter extends CodeConverterBase<RTypeDeclarationInput, RTypeDeclaration> {

    //#region [ implements CodeConverterBase ]
    convert(input: RTypeDeclarationInput): RTypeDeclaration {
        var sourceFile = this.ts.project.getSourceFile(input.sourceFile);

        var output = input.isInterface
            ? this.convertFromInterface(sourceFile.getInterfaces().find(x => x.getName() == input.name))
            : this.convertFromClass(sourceFile.getClasses().find(x => x.getName() == input.name))

        output.codeToInclude = 
        return output;
    }
    //#endregion

    //#region [ constructor ]
    constructor(ts: TSCode) {
        super(ts);
    }
    //#endregion

    convertFromClass(declaration?: ClassDeclaration): RTypeDeclaration {
        if (!declaration) {
            throw new Error("Class Not found");
        }
        const output = new RTypeDeclaration();
        output.name = declaration.getName();
        output.sourceFile = declaration.getSourceFile().getFilePath();
        output.baseType = declaration.getBaseClass()
            ? this.ts.RType.convert(declaration.getBaseClass().getType())
            : undefined;

        output.arguments = declaration.getTypeParameters().map(x => this.ts.RType.convert(x.getType()));
        output.properties = declaration.getProperties().map(x => ({
            name: x.getName(),
            type: this.ts.RType.convert(x.getType()),
            decorators: this.getPropertyDecorators(x)
        }));

        return output;
    }

    convertFromInterface(declaration: InterfaceDeclaration): RTypeDeclaration {
        if (!declaration) {
            throw new Error("Interface Not found");
        }

        const output = new RTypeDeclaration();
        output.name = declaration.getName();
        output.sourceFile = declaration.getSourceFile().getFilePath();
        output.baseType = undefined;
        output.arguments = [];
        output.properties = declaration.getProperties().map(x => ({
            name: x.getName(),
            type: this.ts.RType.convert(x.getType()),
            decorators: new Array<RDecorator>(),
        }));
        return output;
    }

    getIncludedCode(declaration: ClassDeclaration): string | undefined {
        const results: string[] = [];
        declaration.getMethods().forEach(method => {
            method.getDecorators().forEach(deco => {
                if (deco.getName() == 'IncludeMethod') {
                    results.push(deco.getText());
                }
            });
        });
        return results.length == 0
            ? undefined
            : results.join('\n');
    }

    private getPropertyDecorators(p: PropertyDeclaration) {
        return p.getDecorators().map(decorator => {
            const hasArg = decorator.getArguments().length > 0;
            let options = undefined;
            if (hasArg) {
                const arg = decorator.getArguments()[0] as ObjectLiteralExpression;
                try {
                    options = eval(`Object.assign(${arg.getText()})`)
                } catch (err) {
                    console.log(`[error][RTypeDeclarationConverter] getPropertyDecorators(...): Model: ${p.getParent().getName()}, property: ${p.getName()}, decorator: '${decorator.getName()}', error: ${err.message}`);
                }
            }
            return new RDecorator({
                name: decorator.getName(),
                options: hasArg
                    ? options
                    : undefined
            });
        });
    }
}