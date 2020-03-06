import { command, Context, metadata, Options, option } from 'clime';
import * as mustache from 'mustache';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

import { CommandBase } from '../../../base';
import { FS } from '../../../services/fs';
import { TSCode } from '../../../services/ws/tscode/TSCode';
import { TSConverter } from '../../../services/ws/exporters/ts/TSConverter';
import { Shell } from '../../../services/shell';

class CommandOptions extends Options {
    @option({
        flag: 'o',
        required: true,
        description: 'output folder - where npm package are created.',
    })
    public output: string;

    @option({
        flag: 'i',
        default: false,
        required: false,
        toggle: true,
        description: 'execute npm install after generation',
    })
    public install: boolean;
}

// tslint:disable-next-line: max-classes-per-file
@command({
    description: 'Generate wsapi server template',
})
export default class extends CommandBase {

    constructor() {
        super(__filename);
    }

    @metadata
    async execute(
        options: CommandOptions,
        context: Context,
    ): Promise<string> {

        const config = this.getOptions<CommandOptions>(options, context.cwd);
        const target = resolve(context.cwd, options.output);
        console.log(target);

        const assets = this.getAssets();

        //#region [ check ]
        console.log('[check] command assets');
        if (!assets.exists) {
            throw new Error(`assets folder for command "nex ${this.commandPath.join(' ')}" is missing`);
        }
        //#endregion

        //#region [1] STATIC FOLDER
        console.log('[1] STATIC FOLDER');
        const staticSource = assets.getPath('static');
        FS.copyFolder(staticSource, target);
        //#endregion           

        //#region [2] post commands
        console.log('[2] post commands');
        if (options.install) {
            try {
                await Shell.exec(`cd ${target} && npm install`, { stdout: true, rejectOnError: true });
            } catch (err) {
                console.error(err);
            }
        }
        //#endregion

        return `${this.commandName} finished.`;
    }
}
