import { Context } from 'clime';
import { CommandBase } from './CommandBase';
export declare class Config<T> {
    readonly value: T;
    get exists(): boolean;
    constructor(command: CommandBase, context: Context);
}
