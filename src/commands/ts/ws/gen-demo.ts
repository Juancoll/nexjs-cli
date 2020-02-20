import { command, Context, metadata, Options, option } from 'clime';
import * as mustache from 'mustache';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

import { CommandBase } from '../../../base';
import { FS } from '../../../services/fs';
import { TSCode } from '../../../services/ws/tscode/TSCode';
import { TSConverter } from '../../../services/ws/exporters/ts/TSConverter';
import { Shell } from '../../../services/shell';

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

class CommandOptions extends Options {
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

        const ts = new TSConverter();

        //#region [2] create model files
        console.log('[step 2] create models');
        const modelViews = dependencies.map(x => ts.Model.convert(x.declaration));
        modelViews.forEach(view => {
            const src = assets.path('templates/model.ts');
            const dest = join(target, 'src', 'models', `${view.name}.ts`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, view);
            });
        });

        //#region [3] create index model
        console.log('[step 2] create index model');
        const modelsIndexView = ts.ModelIndex.convert(dependencies.map(x => x.declaration));
        const modelIndexSrc = assets.path('templates/model.index.ts');
        const modelIndexDest = join(target, 'src', 'models', `index.ts`);
        FS.copyFile(modelIndexSrc, modelIndexDest, (s, t, c) => {
            console.log(`  |- [create]  ${t}`);
            return mustache.render(c, modelsIndexView);
        });
        //#endregion


        //#region [4] generate ws service files
        const serviceViews = services.map(service => ts.WSService.convert(service));
        console.log('[step 4] generate ws service files');
        serviceViews.forEach(view => {
            const src = assets.path('templates/WSService.ts');
            const dest = join(target, 'src', 'api', 'services', `${view.serviceUpperName}WSService.ts`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, view);
            });
        });
        //#endregion

        //#region [5] copy and parse out folder
        console.log('[step 5] copy and parse out folder');
        const source = assets.path('out');
        const apiView = ts.WSApi.convert({
            packageName: config.value.packageName,
            packageVersion: config.value.packageVersion,
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

        //#region [6] post commands
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
        //#endregion 

        return `${this.commandName} finished.`;
    }
}
