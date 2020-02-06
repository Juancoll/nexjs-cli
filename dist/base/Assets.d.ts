import { CommandBase } from './CommandBase';
export declare class Assets {
    readonly root: string;
    get exists(): boolean;
    constructor(command: CommandBase);
    path(...args: string[]): string;
    readTextFile(...args: string[]): string;
}
