import { RType } from '../reflection/RType';
import { Type } from 'ts-morph';
import { WSHubDecoratorOptions } from './decorators/WSHubDecoratorOptions';
import { RDecorator } from '../reflection/RDecorator';

export class WSHubEvent {
    name: string;
    credentials: RType;
    data: Type;
    options: WSHubDecoratorOptions;
    decorators: RDecorator;
}