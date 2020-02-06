import { Command, Context } from 'clime';
import { Config } from './config';
import { Assets } from './Assets';
export declare abstract class CommandBase extends Command {
    readonly filename: string;
    readonly commandPath: string[];
    readonly commandName: string;
    constructor(filename: string);
    getConfig<T>(context: Context): Config<T>;
    getAssets(): Assets;
}
