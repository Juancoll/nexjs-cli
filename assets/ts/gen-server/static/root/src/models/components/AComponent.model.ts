import { ModelComponent } from '../base/component.model';
import { IncludeModel } from '@nexjs/wsserver';

@IncludeModel
export class ACompoment extends ModelComponent {
    data1: string;
    data2: number;
    constructor() {
        super();
    }
}
