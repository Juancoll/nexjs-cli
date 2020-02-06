import { command, Context, metadata, Options, option } from 'clime';
import * as mustache from 'mustache';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

import { FS } from '../../services/fs';
import { WSApiDescriptor, IServiceDescriptor, Models } from '../../services/ws';
import { CommandBase } from '../../base';
import { Shell } from '../../services/shell';

interface IConfigModels {
    source: string;
    importsToRemove: string[];
    decoratorsToRemove: string[];
}

interface IConfig {
    outDir: string;
    packageName: string;
    packageVersion: string;
    suffix: string;
    models: IConfigModels;

}

interface ITemplateData {
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
    description: 'Generate wsapi client for typescript context',
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

        // [1] create data view
        console.log('[step 1] create data view');
        const dataView = {
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
        FS.copyFolder(source, target, (s, t, c) => {
            console.log(`  |- [create]  ${t}`);
            return mustache.render(c, dataView);
        });

        // [3] create service files
        console.log('[step 3] generate ws service files');
        dataView.services.forEach(item => {
            const src = assets.path('templates/WSService.ts');
            const dest = join(target, 'src', 'api', 'services', `${item.service.upper}WSService.ts`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, item);
            });
        });

        // [4] copy models
        console.log('[step 4] copy models');
        const modelsSource = resolve(context.cwd, config.value.models.source);
        const modelsTarget = resolve(config.value.outDir, config.value.models.source);
        console.log(`  |- [source]  ${modelsSource}`);
        console.log(`  |- [target]  ${modelsTarget}`);
        FS.copyFolder(modelsSource, modelsTarget, (s, t, c) => {
            console.log(`  |- [create]  ${t}`);
            return c;
        });

        // [5] clean models
        console.log('[step 5] clean *.ts files models (remove imports and decorators)');
        console.log(`  |- [imports]    remove '${config.value.models.importsToRemove.join(',')}'`);
        console.log(`  |- [decorators] remove '${config.value.models.decoratorsToRemove.join(',')}'`);
        const models = new Models(
            target,
            config.value.models.importsToRemove,
            config.value.models.decoratorsToRemove,
        );
        models.apply();
        models.save();

        // [6] post commands
        console.log('[step 6] post commands');
        if (options.install) {
            try {
                await Shell.exec(`cd ${target} && npm install`, { stdout: true, rejectOnError: true });
            } catch (err) {
                console.error(err);
            }
        }

        if (options.build) {
            try {
                await Shell.exec(`cd ${target} && npm run build`, { stdout: true, rejectOnError: true });
            } catch (err) {
                console.error(err);
            }
        }

        return `${this.commandName} finished.`;
    }
}
