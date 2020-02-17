import { RTypeDeclaration } from './RTypeDeclaration';

export class RType {
    isPrimitive: boolean;
    name: string;
    isArray: boolean;
    arguments: RType[] | undefined;
    sourceFile: string;
    declaration: RTypeDeclaration;
}