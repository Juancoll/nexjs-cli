import { ApiProperty } from '@nestjs/swagger';
import { CSProperty } from '@/lib/ws';

export abstract class ModelComponent {
    _type: string;

    @CSProperty({ type: 'JToken' })
    data: any;

    constructor() {
        this._type = this.constructor.name;
    }
}
