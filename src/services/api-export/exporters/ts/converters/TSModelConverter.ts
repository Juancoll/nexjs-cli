import { ConverterBase } from '../../base/ConverterBase';
import { RTypeDeclaration } from '../../../models/base/RTypeDeclaration';
import { RParam } from 'src/services/api-export/models/base/RParam';
import { TSConverter } from '../TSConverter';

export interface ITSImport {
    type: string;
    path: string;
}

export interface ITSModelProperty {
    name: string;
    type: string;
}

export interface ITSModelView {
    imports: ITSImport[];
    name: string;
    declaration: string;
    properties: ITSModelProperty[];
}

export class TSModelConverter extends ConverterBase<TSConverter, RTypeDeclaration, ITSModelView>{

    //#region [ implement IConverter ]
    convert(input: RTypeDeclaration): ITSModelView {
        return {
            imports: this.getImports(input),
            name: input.name,
            declaration: this.getDeclaration(input),
            properties: input.properties.map(x => this.getProperty(x))
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor(parent: TSConverter) {
        super(parent);
    }
    //#endregion

    //#region  [ private ]
    private getImports(d: RTypeDeclaration): ITSImport[] {
        return d.getDependencies().map(x => ({
            type: x.name,
            path: `./${x.name}`,
        }));
    }
    private getDeclaration(d: RTypeDeclaration): string {
        let result = d.name;
        if (d.arguments.length > 0) {
            result += `<${d.arguments.map(x => this.parent.getTypeInstanceName(x)).join(',')}>`
        }
        if (d.baseType) {
            result += ` extends ${this.parent.getTypeInstanceName(d.baseType)}`
        }
        return result;
    }
    private getProperty(p: RParam): ITSModelProperty {
        return {
            name: p.name,
            type: this.getPropertyType(p)
        };
    }
    private getPropertyType(p: RParam): string {
        return this.parent.getTypeInstanceName(p.type);;
    }
    //#endregion
}