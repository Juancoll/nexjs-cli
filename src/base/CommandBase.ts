import { Command, Context } from 'clime';
import { Config } from './config';
import { Assets } from './Assets';
import { basename, resolve, relative } from 'path';
import * as upath from 'upath';

export abstract class CommandBase extends Command {

    public readonly filename: string;
    public readonly commandPath: string[];
    public readonly commandName: string;

    constructor(filename: string) {
        super();
        this.filename = filename;
        this.commandName = basename(filename).replace(/\.[^/.]+$/, '');

        const commandsFolderPath = resolve(__dirname, '../commands');
        const relativePathFromCommandsFolder = upath.normalize(relative(commandsFolderPath, this.filename));
        this.commandPath = relativePathFromCommandsFolder.split('/');
        const lastIdx = this.commandPath.length - 1;
        this.commandPath[lastIdx] = this.commandPath[lastIdx].replace(/\.[^/.]+$/, '');
    }

    public getConfig<T>(context: Context) {
        return new Config<T>(this, context);
    }
    public getAssets() {
        return new Assets(this);
    }
}
