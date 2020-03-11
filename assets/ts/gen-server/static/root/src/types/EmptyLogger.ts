import { LoggerService } from '@nestjs/common';

export class EmptyLogger implements LoggerService {
    log(message: any, context?: string) {
        // throw new Error('Method not implemented.');
    }
    error(message: any, trace?: string, context?: string) {
        // throw new Error('Method not implemented.');
    }
    warn(message: any, context?: string) {
        // throw new Error('Method not implemented.');
    }
    debug?(message: any, context?: string) {
        // throw new Error('Method not implemented.');
    }
    verbose?(message: any, context?: string) {
        // throw new Error('Method not implemented.');
    }
}
