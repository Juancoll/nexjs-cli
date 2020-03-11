import { RParam } from '../../../models/base/RParam';
import { RTypeDeclaration } from '../../../models/base/RTypeDeclaration';
import { ConverterBase } from '../../base/ConverterBase';
import { CSConverter } from '../CSConverter';

export interface ICSModelInput {
    typeDeclaration: RTypeDeclaration,
    namespace: string;
}

export interface ICSModelProperty {
    name: string;
    type: string;
}

export interface ICSModelView {
    namespace: string;
    name: string;
    declaration: string;
    properties: ICSModelProperty[];
}

export class CSModelConverter extends ConverterBase<CSConverter, ICSModelInput, ICSModelView>{

    //#region [ implement IConverter ]
    convert(input: ICSModelInput): ICSModelView {
        return {
            namespace: input.namespace,
            name: input.typeDeclaration.name,
            declaration: this.getDeclaration(input.typeDeclaration),
            properties: input.typeDeclaration.properties.map(x => this.getProperty(x))
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor(parent: CSConverter) {
        super(parent);
    }
    //#endregion

    //#region  [ private ]
    private getDeclaration(d: RTypeDeclaration): string {
        let result = d.name;
        if (d.arguments.length > 0) {
            result += `<${d.arguments.map(x => this.parent.getTypeInstanceName(x)).join(',')}>`
        }
        if (d.baseType) {
            result += `: ${this.parent.getTypeInstanceName(d.baseType)}`
        }
        return result;
    }
    private getProperty(p: RParam): ICSModelProperty {
        return {
            name: p.name,
            type: this.getPropertyType(p)
        };
    }
    private getPropertyType(p: RParam): string {
        const decorator = p.decorators.find(x => x.name == "CSProperty");
        if (decorator) {
            var type = decorator.options.type;
            if (type) {
                return type;
            }
        }
        return this.parent.getTypeInstanceName(p.type);;
    }
    //#endregion
}