import { command, Context, metadata, Options, option } from 'clime';
import * as mustache from 'mustache';
import { resolve, join } from 'path';
import { existsSync, rename } from 'fs';

import { CommandBase } from '../../base';
import { FS } from '../../services/fs';
import { WSApiDescriptor, IServiceDescriptor, ModelsFolder } from '../../services/ws';
import { Shell } from '../../services/shell';
import { BaseType } from '../../services/ws/Models/BaseType';
import { CSClass } from '../../services/ws/csharp/CSClass';
import { CSService } from '../../services/ws/csharp/CSService';

interface IConfig {
    outDir: string;
    packageName: string;
    packageVersion: string;
    suffix: string;
}

interface ITemplateData {
    namespace: string;
    config: IConfig;
    context: {
        command: string;
        cwd: string;
    };
    services: IServiceDescriptor[];
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
        const csharpDescriptors = descriptors.map(x => new CSClass(config.value.packageName, x));
        console.log(csharpDescriptors);

        // [1] create data view
        console.log('[step 1] create data view');
        const dataView = {
            namespace: config.value.packageName,
            config: config.value,
            context: {
                cwd: context.cwd,
                command: this.commandPath.join(' '),
            },
            services: reflection.getServiceDescriptors(),
        } as ITemplateData;

        // [2] parse all out folder
        console.log('[step 2] generate common files');
        const source = assets.path('out');
        const target = resolve(context.cwd, config.value.outDir);
        FS.copyFolder(
            source,
            target,
            (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, dataView);
            },
            (filename) => mustache.render(filename, dataView),
        );

        // [3] create service files
        console.log('[step 3] generate ws service files');
        dataView.services.forEach(item => {
            var service = new CSService(config.value.packageName, item);
            const src = assets.path('templates/WSService.cs');
            const dest = join(target, 'src', config.value.packageName, 'src', 'api', 'services', `${service.service.upper}WSService.cs`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, service);
            });
        });

        // [4] create model files
        console.log('[step 4] generate models ');
        csharpDescriptors.forEach(item => {
            const src = assets.path('templates/model.cs');
            const dest = join(target, 'src', config.value.packageName, 'src', 'models', `${item.fileName}.cs`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, item);
            });
        });

        return `${this.commandName} finished.`;
    }
}
