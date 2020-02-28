import * as Collection from 'typescript-collections';
import { ExceptionEventArgs } from '@/lib/nexcode/types';

import { IClientContract } from './IClientContract';
import { IWSConnectionContext } from '../../types/IWSConnectionContext';
import { WSConnectionCloseEventArgs } from '../../types/WSConnectionCloseEventArgs';
import { IWSClient } from '../../client/IWSClient';

export class ClientContractCollection implements IClientContract {

    // [ private fields ]
    private _contracts: Collection.Dictionary<string, IClientContract>;
    private _client: IWSClient;
    private _isOpenend: boolean = false;

    // [ constructor ]
    constructor(client: IWSClient) {
        this._client = client;
        this._contracts = new Collection.Dictionary<string, IClientContract>();
    }

    // [ public methods ]
    public add(contract: IClientContract): ClientContractCollection {

        this._contracts.setValue(contract.contractName, contract);
        contract.client = this.client;
        return this;
    }
    public get<TContract extends IClientContract>(contractName: string): TContract {
        return this._contracts.getValue(contractName) as TContract;
    }

    // [ IClientContract ]
    public contractName: string = 'contractCollection';
    public get client(): IWSClient {
        return this._client;
    }
    public set client(value: IWSClient) {
        this._client = value;
    }
    _open(context: IWSConnectionContext | null): void {
        this._contracts.forEach((key, value) => { value._open(context); });
        this._isOpenend = true;
    }
    _close(e: WSConnectionCloseEventArgs): void {
        if (this._isOpenend) {
            this._isOpenend = false;
            this._contracts.forEach((key, value) => { value._close(e); });
        }
    }
    _error(e: ExceptionEventArgs): void {
        this._contracts.forEach((key, value) => { value._error(e); });
    }
    _receive(msg: string, json: any): void {
        this._contracts.forEach((key, value) => { value._receive(msg, json); });
    }
    onError(action: (e: ExceptionEventArgs) => void): IClientContract {
        return this;
    }
}
