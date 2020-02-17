import { WSClientBase } from '../lib';
import { UserWSService } from './services/UserWSService';

export class WSApi extends WSClientBase {
    public readonly user = new UserWSService(this.rest, this.hub);
}
