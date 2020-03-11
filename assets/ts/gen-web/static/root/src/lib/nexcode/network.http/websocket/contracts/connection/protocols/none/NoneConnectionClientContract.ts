import { ConnectionClientContractBase } from '../../base/ConnectionClientContractBase';
import { IConnectionMessage } from '../../types/IConnectionMessage';

export class NoneConnectionClientContract extends ConnectionClientContractBase {

    //#region [ ConnectionClientContractBase ]
    public get protocol(): string {
        return 'none';
    }
    protected onStartProtocol(): void { /* empty */ }
    protected onReceiveConnectionMessage(msg: IConnectionMessage): void { /* empty */ }
    //#endregion
}
