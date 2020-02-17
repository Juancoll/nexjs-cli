import { WSHubEvent } from './WSHubEvent';
import { WSRestMethod } from './WSRestMethod';

export class WSService {
    name: string;
    hubEvents: WSHubEvent[];
    restMethods: WSRestMethod[];
}