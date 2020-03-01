import { command, Context, metadata, Options, option } from 'clime';
import * as mustache from 'mustache';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

import { CommandBase } from '../../../base';
import { FS } from '../../../services/fs';
import { Shell } from '../../../services/shell';
import { TSCode } from '../../../services/ws/tscode/TSCode';
import { CSConverter } from '../../../services/ws/exporters/cs/CSConverter';

export class CommandOptions extends Options {
    @option({
        flag: 's',
        required: false,
        description: 'source folder - must contain ws contract server',
    })
    public source: string;

    @option({
        flag: 'o',
        required: false,
        description: 'output folder - where npm package are created.',
    })
    public output: string;

    @option({
        flag: 'n',
        required: false,
        description: 'package name',
    })
    public name: string;

    @option({
        flag: 'x',
        required: false,
        default: ".contract.ts",
        description: 'suffix file, to select posible contracts',
    })
    public suffix: string;
}

// tslint:disable-next-line: max-classes-per-file
@command({
    description: 'Generate wsapi demo for c# context',
})
export default class extends CommandBase {
    constructor() {
        super(__filename);
    }

    @metadata
    async execute(
        options: CommandOptions,
        context: Context,
    ) {
        const config = this.getOptions<CommandOptions>(options, options.source ? options.source : context.cwd);
        const cwd = config.source
            ? resolve(options.source)
            : context.cwd;

        const assets = this.getAssets();

        //#region [ checks ]
        console.log('[check] name');
        if (!config.name) {
            throw new Error(`option name is required.`);
        }
        console.log('[check] command assets');
        if (!assets.exists) {
            throw new Error(`assets folder for command "nex ${this.commandPath.join(' ')}" is missing`);
        }

        console.log('[check] is typescript project');
        if (!existsSync(resolve(cwd, 'tsconfig.json'))) {
            throw new Error(`file tsconfig.json not found.`);
        }
        //#endregion

        const target = resolve(cwd, config.output);

        //#region [1] OUT FOLDER
        console.log('[1] OUT FOLDER');
        const outSource = assets.getPath('out');
        const outView = { name: config.name };
        FS.copyFolder(outSource, target, (s, t, c) => {
            console.log(`  |- [create]  ${t}`);
            return mustache.render(c, outView);
        });
        //#endregion  

        //#region [2] create lib 
        console.log('[2] create lib');
        const libTarget = join(target, 'src', 'ws');
        await Shell.exec(`nex cs ws up-client -s ${cwd} -o ${libTarget} -n ${config.name}`, { stdout: true, rejectOnError: true });

        return `${this.commandName} finished.`;
    }
}
