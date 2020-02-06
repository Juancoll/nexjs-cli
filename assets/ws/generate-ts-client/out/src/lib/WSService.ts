import { RestClient } from './RestClient';
import { HubClient } from './HubClient';
import { HubNotification } from './Notification';

export abstract class WSService {
    public abstract name: string;
    constructor(
        protected readonly rest: RestClient,
        protected readonly hub: HubClient,
    ) { }

    request<T>(args: { method: string, data?: any, credentials?: any, timeout?: number }) {
        return this.rest.requestAsync<T>({
            service: this.name,
            method: args.method,
            data: args.data,
            credentials: args.credentials,
            timeout: args.timeout,
        });
    }
    newEvent<TCredentials, TData>(event: string) {
        return new HubNotification<TCredentials, TData>(this.hub, this.name, event);
    }
}
