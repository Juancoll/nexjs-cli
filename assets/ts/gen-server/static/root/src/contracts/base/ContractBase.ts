import { IName } from '@nexjs/wsserver';
import { Logger, LoggerService } from '@nestjs/common';
import { EmptyLogger } from '@/types/EmptyLogger';

export abstract class ContractBase implements IName {
    //#region [ IName ]
    public readonly abstract name: string;
    //#endregion

    //#region  [ properties ]
    public logger: LoggerService;
    public set debug(value: boolean) {
        this.logger = this.debug
            ? new Logger(this.constructor.name)
            : this.logger = new EmptyLogger();
    }
    //#endregion

    //#region  [ constructor ]
    constructor() {
        this.debug = true;
    }
    //#endregion
}
