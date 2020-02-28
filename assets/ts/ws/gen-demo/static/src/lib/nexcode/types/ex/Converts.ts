import { NumberEx } from './NumberEx';

export class Converts {
    public static convertStringTimeToSeconds(value: string) {
        const split = value.split(':');
        if (split.length != 3) {
            throw new Error(`value = ${value} format error: must be 00:00:00`);
        }
        return parseInt(split[0]) * 60 * 60 + parseInt(split[1]) * 60 + parseInt(split[2]);

    }
    public static convertStringTimeToMillis(value: string) {
        const split = value.split(':');
        if (split.length != 3) {
            throw new Error(`value = ${value} format error: must be 00:00:00`);
        }
        return parseInt(split[0]) * 60 * 60 * 1000 + parseInt(split[1]) * 60 * 1000 + parseInt(split[2]) * 1000;
    }
    public static convertSimpleStringTimeToMillis(value: string) {
        const split = value.split(':');
        if (split.length != 2) {
            throw new Error(`value = ${value} format error: must be 00:00:00`);
        }
        return parseInt(split[0]) * 60 * 60 * 1000 + parseInt(split[1]) * 60 * 1000;
    }
    public static convertSecondsToString(seconds: number) {
        const hours = Math.floor(seconds / (60 * 60));
        const restHours = seconds % (60 * 60);
        const minutes = Math.floor(restHours / (60));
        const restSeconds = Math.trunc(restHours % (60));
        const strTime = `${NumberEx.pad(hours, 2)}:${NumberEx.pad(minutes, 2)}:${NumberEx.pad(restSeconds, 2)}`;
        return strTime;
    }
    public static convertMillisToString(millis: number) {
        const hours = Math.floor(millis / (60 * 60 * 1000));
        const restHours = millis % (60 * 60 * 1000);

        const minutes = Math.floor(restHours / (60 * 1000));
        const restMinutes = restHours % (60 * 1000);

        const seconds = Math.floor(restMinutes / (1000));
        const restSeconds = Math.trunc(restMinutes % (1000));

        const strTime = `${NumberEx.pad(hours, 2)}:${NumberEx.pad(minutes, 2)}:${NumberEx.pad(seconds, 2)}`;
        return strTime;
    }
    public static convertSecondsToSimpleString(seconds: number) {
        const hours = Math.floor(seconds / (60 * 60));
        const restHours = seconds % (60 * 60);
        const minutes = Math.floor(restHours / (60));
        const strTime = `${NumberEx.pad(hours, 2)}:${NumberEx.pad(minutes, 2)}`;
        return strTime;
    }
    public static convertMillisToSimpleString(millis: number) {
        const hours = Math.floor(millis / (60 * 60 * 1000));
        const restHours = millis % (60 * 60 * 1000);

        const minutes = Math.floor(restHours / (60 * 1000));

        const strTime = `${NumberEx.pad(hours, 2)}:${NumberEx.pad(minutes, 2)}`;
        return strTime;
    }
}
