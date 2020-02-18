import { RParam } from './RParam';
import { RType } from './RType';
import { RDependencies } from './RDependencies';

export class RTypeDeclaration {
    name: string;
    properties: RParam[];
    arguments: RType[];
    baseType: RType | undefined;
    sourceFile: string;

    getDependencies(): RType[] {
        var dependencies = new RDependencies();

        dependencies.addType(this.baseType);
        dependencies.addTypes(this.properties.map(x => x.type));
        dependencies.addTypes(this.arguments);

        return dependencies.get();
    }
}