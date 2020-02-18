import { RTypeDeclaration } from './RTypeDeclaration';
import { RDependencies } from './RDependencies';

export class RType {
    isPrimitive: boolean;
    name: string;
    isArray: boolean;
    arguments: RType[];
    sourceFile: string;
    declaration: RTypeDeclaration;

    constructor(init?: Partial<RType>) { Object.assign(this, init); }

    getDependencies(): RType[] {
        var dependencies = new RDependencies();

        dependencies.addTypes(this.arguments);
        if (this.declaration) {
            dependencies.addTypes(this.declaration.getDependencies());
        }

        return dependencies.get();
    }

    public static distinc(values: RType[]) {
        const output = new Array<RType>();
        values.forEach(type => {
            if (!output.find(x => type.name == x.name && type.sourceFile == x.sourceFile)) {
                output.push(type);
            }
        });
        return output;
    }
}