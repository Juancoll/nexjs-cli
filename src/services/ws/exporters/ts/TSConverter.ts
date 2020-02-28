import { RType } from '../../models/base/RType';
import { TSModelConverter } from './converters/TSModelConverter';
import { TSModelIndexConverter } from './converters/TSModelIndexConverter';
import { TSHubConverter } from './converters/TSWSHubConverter';
import { TSRestConverter } from './converters/TSWSRestConverter';
import { TSWSServiceConterter } from './converters/TSWSServiceConterter';
import { TSWSApiConverter } from './converters/TSWSApiConverter';
import { TSTypeDefaultValue } from './converters/TSTypeDefaultValue';

export class TSConverter {

    //#region [ converters ]
    public readonly Model = new TSModelConverter(this);
    public readonly ModelIndex = new TSModelIndexConverter(this);
    public readonly WSRest = new TSRestConverter(this);
    public readonly WSHub = new TSHubConverter(this);
    public readonly WSService = new TSWSServiceConterter(this);
    public readonly WSApi = new TSWSApiConverter(this);
    public readonly TypeDefaultValue = new TSTypeDefaultValue(this);
    //#endregion

    //#region [ commons ]
    public getTypeInstanceName(t: RType): string {
        if (t.isArray) {
            var type = this.getTypeInstanceName(t.arguments[0]);
            return type.indexOf('<') == -1
                ? `${type}[]`
                : `Array<${type}>`;
        }
        else {
            let result = t.name;
            if (t.arguments.length > 0) {
                result += `<${t.arguments.map(x => this.getTypeInstanceName(x)).join(',')}>`;
            }
            return result;
        }
    }
    //#endregion
}