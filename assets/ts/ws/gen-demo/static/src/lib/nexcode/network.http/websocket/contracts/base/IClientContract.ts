import { ExceptionEventArgs } from '@/lib/nexcode/types';

import { IWSClient } from '../../client/IWSClient';
import { IWSConnectionContext } from '../../types/IWSConnectionContext';
import { WSConnectionCloseEventArgs } from '../../types/WSConnectionCloseEventArgs';
import { IContract } from './IContract';

export interface IClientContract extends IContract {
    client: IWSClient | null;

    _open(context: IWSConnectionContext | null): void;
    _close(e: WSConnectionCloseEventArgs): void;
    _error(e: ExceptionEventArgs): void;
    _receive(msg: string, json: any): void;

    onError(action: (e: ExceptionEventArgs) => void): IClientContract;
}
