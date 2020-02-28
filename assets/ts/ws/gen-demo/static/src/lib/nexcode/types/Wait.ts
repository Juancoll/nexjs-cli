import { DelayAsync } from './Delay';

export class Wait {
    while(condition: () => boolean, timeout: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            while (condition()) {
                await new DelayAsync().start(200);
            }
            resolve();
        });
    }
    until(condition: () => boolean, timeout: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            while (!condition()) {
                await new DelayAsync().start(200);
            }
            resolve();
        });
    }
}
