import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
    public logger = new Logger('AppService');

    constructor() {
        this.logger.log('constructor');
    }
}
