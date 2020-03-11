import { SimpleEventDispatcher } from 'strongly-typed-events';

import { IClientContract } from '../../base/IClientContract';
import { IWSConnectionContext } from '../../../types/IWSConnectionContext';

export interface IConnectionClientContract extends IClientContract {
    protocol: string;
    onOpenConnection: SimpleEventDispatcher<IWSConnectionContext>;
}
