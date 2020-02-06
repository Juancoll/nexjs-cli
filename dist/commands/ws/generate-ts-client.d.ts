import { Context, Options } from 'clime';
import { CommandBase } from '../../base';
export declare class CommandOptions extends Options {
    install: boolean;
    build: boolean;
}
export default class extends CommandBase {
    constructor();
    execute(options: CommandOptions, context: Context): Promise<string>;
}
