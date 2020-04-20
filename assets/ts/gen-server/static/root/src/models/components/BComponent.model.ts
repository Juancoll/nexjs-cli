import { ModelComponent } from '../base/component.model';
import { IncludeModel } from '@nexjs/wsserver';

@IncludeModel
export class BCompoment extends ModelComponent {
    var1: string;
    var2: number;
    constructor() {
        super();
    }
}
