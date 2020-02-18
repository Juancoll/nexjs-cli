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
import { TSCode } from '../../services/api-export/tscode/TSCode';
import { CSConverter } from '../../services/api-export/exporters/cs/CSConverter';

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
    async execute(
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

        const target = resolve(context.cwd, config.value.outDir);

        //#region [1] Code analysis 
        console.log('[step 1] code analisis');
        const tscode = new TSCode(context.cwd, config.value.suffix);
        const services = tscode.WSService.convert();
        const dependencies = tscode.getDependencies(services);
        //#endregion

        const cs = new CSConverter();

        //#region [2] create model files
        console.log('[step 2] create models');

        const modelViews = dependencies.map(x => cs.Model.convert({
            namespace: config.value.packageName,
            typeDeclaration: x.declaration,
        }));

        modelViews.forEach(view => {
            const src = assets.path('templates/model.cs');
            const dest = join(target, 'src', config.value.packageName, 'src', 'models', `${view.name}.cs`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, view);
            });
        });
        //#endregion

        //#region [3] generate ws service files
        const serviceViews = services.map(service => cs.WSService.convert({
            namespace: config.value.packageName,
            wsservice: service
        }));

        console.log('[step 3] generate ws service files');
        serviceViews.forEach(view => {
            const src = assets.path('templates/WSService.cs');
            const dest = join(target, 'src', config.value.packageName, 'src', 'api', 'services', `${view.serviceUpperName}WSService.cs`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, view);
            });
        });
        //#endregion

        //#region [4] copy and parse out folder
        console.log('[step 4] copy and parse out folder');
        const source = assets.path('out');
        const apiView = cs.WSApi.convert({
            namespace: config.value.packageName,
            version: config.value.packageVersion,
            services: services,
        });
        FS.copyFolder(
            source,
            target,
            (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, apiView);
            },
            (filename) => mustache.render(filename, apiView),
        );
        //#endregion

        //#region [5] post commands
        console.log('[step 6] post commands');
        if (options.build) {
            try {
                await Shell.exec(`cd ${target} && .\\build.bat`, { stdout: true, rejectOnError: true });
            } catch (err) {
                console.error(err);
            }
        }
        //#endregion

        return `${this.commandName} finished.`;
    }
}
