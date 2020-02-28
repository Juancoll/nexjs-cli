import { Component, Vue } from 'vue-property-decorator';
import { registerService } from '../registerService';

@Component({})
export class EventService extends Vue {
}

export * from './EventKeys';
export let eventService = new EventService();
registerService('events', eventService);
