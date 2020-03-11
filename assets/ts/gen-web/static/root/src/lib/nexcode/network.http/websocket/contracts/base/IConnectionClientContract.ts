import { EventDispatcher } from 'strongly-typed-events';

import { IClientContract } from './IClientContract';
import { IWSConnectionContext } from '../../types/IWSConnectionContext';

export interface IConnectionClientContract extends IClientContract {
    onReadyToOpen: EventDispatcher<IConnectionClientContract, IWSConnectionContext>;
}
