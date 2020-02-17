import { Decorator } from 'ts-morph';
import { WSRestDecoratorOptions } from './decorators/WSRestDecoratorOptions';
import { RParam } from '../reflection/RParam';
import { RType } from '../reflection/RType';

export class WSRestMethod {
    name: string;
    params: RParam[];
    returnType: RType;
    options: WSRestDecoratorOptions;

    tsDecorators: Decorator[];
}