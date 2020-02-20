import { RType } from '../base/RType';
import { WSHubDecoratorOptions } from './decorators/WSHubDecoratorOptions';
import { RDecorator } from '../base/RDecorator';
import { RDependencies } from '../base/RDependencies';

export class WSHubEvent {

    //#region [ properties ]
    public name: string;
    public data: RType;
    public options: WSHubDecoratorOptions;
    public decorators: RDecorator[];
    //#endregion

    constructor(init?: Partial<WSHubEvent>) { Object.assign(this, init); }

    getDependencies(): RType[] {
        var dependencies = new RDependencies();

        dependencies.addType(this.options.credentials);
        dependencies.addType(this.data);

        return dependencies.get();
    }
}