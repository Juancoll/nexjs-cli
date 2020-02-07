import { command, Context, metadata, Options, option } from 'clime';
import * as mustache from 'mustache';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

import { CommandBase } from '../../base';
import { FS } from '../../services/fs';
import { WSApiDescriptor, IServiceDescriptor, ModelsFolder } from '../../services/ws';
import { Shell } from '../../services/shell';
import { BaseType } from '../../services/ws/Models/BaseType';
import { CSharpClass } from '../../services/ws/csharp/CSharpClass';

interface IConfig {
    outDir: string;
    packageName: string;
    packageVersion: string;
    suffix: string;
}

interface IConfig {
    param: string;
}

export class CommandOptions extends Options {
    @option({
        flag: 'i',
        default: false,
        required: false,
        toggle: true,
        description: 'after, execute npm install',
    })
    public install: boolean;

    @option({
        flag: 'b',
        default: false,
        required: false,
        toggle: true,
        description: 'after, execute npm build',
    })
    public build: boolean;
}

// tslint:disable-next-line: max-classes-per-file
@command({
    description: 'This is a command for printing a greeting message',
})
export default class extends CommandBase {
    constructor() {
        super(__filename);
    }

    @metadata
    execute(
        options: CommandOptions,
        context: Context,
    ) {
        if (process.env.NODE_ENV == 'debug') {
            const cwd = resolve('../../../nodall-training/template.api.server');
            if (!existsSync(cwd)) {
                throw new Error(`cwd '${cwd}' not found`);
            }
            console.log(`[DEBUG] context.env: ${cwd}`);
            context.cwd = cwd;
        }

        const config = this.getConfig<IConfig>(context);
        const assets = this.getAssets();

        console.log('[read] read config from nex-cli.json file');
        if (!config.exists) {
            throw new Error(`config not found. create nex-cli.json file and add config for "${this.commandPath.join(' ')}" command.`);
        }

        console.log('[check] command assets');
        if (!assets.exists) {
            throw new Error(`assets folder for command "nex ${this.commandPath.join(' ')}" is missing`);
        }

        console.log('[check] is typescript project');
        if (!existsSync(resolve(context.cwd, 'tsconfig.json'))) {
            throw new Error(`file tsconfig.json not found.`);
        }

        const reflection = new WSApiDescriptor(
            context.cwd,
            config.value.outDir,
            config.value.suffix,
        );

        console.log('[Models to Import]');
        const descriptors = reflection.getModelToImportDescriptors();
        console.log(descriptors);

        console.log('[CHSARP]');
        const csharpDescriptors = descriptors.map(x => new CSharpClass(config.value.packageName, x));
        console.log(csharpDescriptors);

        // [3] create service files
        console.log('[step 3] generate models ');
        const target = resolve(context.cwd, config.value.outDir);
        csharpDescriptors.forEach(item => {
            const src = assets.path('templates/class.cs');
            const dest = join(target, 'src', 'models', `${item.fileName}.cs`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, item);
            });
        });

        return `${this.commandName} finished.`;
    }
}
