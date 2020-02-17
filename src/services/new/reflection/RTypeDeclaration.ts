import { RParam } from './RParam';
import { RType } from './RType';

export class RTypeDeclaration {
    name: string;
    properties: RParam[];
    arguments: RType[];
    baseType: RType;
    sourceFile: string;

    getDependencies(): RType[] {
        return [];
    }
}