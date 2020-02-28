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
        flag: 'v',
        required: false,
        description: 'package version',
    })
    public version: string;

    @option({
        flag: 'x',
        required: false,
        default: ".contract.ts",
        description: 'suffix file, to select posible contracts',
    })
    public suffix: string;

    @option({
        flag: 'f',
        required: false,
        description: 'private package feed',
    })
    public feed: string;

    @option({
        flag: 'i',
        default: false,
        required: false,
        toggle: true,
        description: 'execute npm install after generation',
    })
    public install: boolean;

    @option({
        flag: 'b',
        default: false,
        required: false,
        toggle: true,
        description: 'execute npm run build after generation',
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

        const config = this.getOptions<CommandOptions>(options, options.source ? options.source : context.cwd);
        const cwd = config.source
            ? resolve(options.source)
            : context.cwd;

        const assets = this.getAssets();

        //#region [ checks ]
        if (!existsSync(cwd)) {
            throw new Error(`source folder '${cwd}' not found`);
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

        const target = resolve(context.cwd, config.output);
        const targetSrc = join(target, 'src');

        //#region [1] Code analysis 
        console.log('[1] code analisis');
        const tscode = new TSCode(cwd, config.suffix);
        const services = tscode.WSService.convert();
        const dependencies = tscode.getDependencies(services);
        //#endregion

        const ts = new TSConverter();

        //#region [2] Models
        console.log('[2] MODELS');

        console.log('[2.1] create models');
        const modelViews = dependencies.map(x => ts.Model.convert(x.declaration));
        modelViews.forEach(view => {
            const src = assets.getPath('templates/models/model.ts');
            const dest = join(targetSrc, 'models', `${view.name}.ts`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, view);
            });
        });

        console.log('[2.2] create index model');
        const modelsIndexView = ts.ModelIndex.convert(dependencies.map(x => x.declaration));
        const modelIndexSrc = assets.getPath('templates/models/index.ts');
        const modelIndexDest = join(targetSrc, 'models', `index.ts`);
        FS.copyFile(modelIndexSrc, modelIndexDest, (s, t, c) => {
            console.log(`  |- [create]  ${t}`);
            return mustache.render(c, modelsIndexView);
        });
        //#endregion

        //#region [3] SERVICES
        console.log('[3] SERVICES');
        const serviceViews = services.map(service => ts.WSService.convert(service));

        console.log('[3.1] create wsapi file');
        const wsapiSource = assets.getPath('templates/services/wsapi.ts');
        const wsapiTarget = join(targetSrc, 'api', `wsapi.ts`);
        const wsapiView = {
            services: serviceViews,
        };
        FS.copyFile(wsapiSource, wsapiTarget, (s, t, c) => {
            console.log(`  |- [create]  ${t}`);
            return mustache.render(c, wsapiView);
        });

        console.log('[3.2] generate ws services');
        serviceViews.forEach(view => {
            const src = assets.getPath('templates/services/WSService.ts');
            const dest = join(targetSrc, 'api', 'services', `${view.serviceUpperName}WSService.ts`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, view);
            });
        });
        //#endregion

        //#region [4] STATIC FOLDER
        console.log('[4] copy static folder');
        const staticSource = assets.getPath('static/src');
        FS.copyFolder(staticSource, targetSrc);
        //#endregion   

        //#region [5] PACKAGE FOLDER
        console.log('[5] copy and parse package folder');
        const pkgSource = assets.getPath('templates/package');
        const pkgView = {
            name: config.name,
            version: config.version,
        }
        FS.copyFolder(
            pkgSource,
            target,
            (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, pkgView);
            }
        );
        //#endregion  

        //#region [6] copy .npmrc
        if (config.feed) {
            console.log('[6] PRIVATE FEED - copy and parse .npmrc file');
            if (!config.name.startsWith('@')) {
                throw new Error('package name must include a namespace to publish it to a private feed');
            }
            const namespace = config.name.split("/")[0];
            const npmrcFileSource = assets.getPath('templates/feeds/.npmrc');
            const npmrcFileTarget = join(target, '.npmrc');
            const npmrcView = {
                namespace,
                feed: config.feed,
            };
            FS.copyFile(
                npmrcFileSource,
                npmrcFileTarget,
                (s, t, c) => {
                    console.log(`  |- [create]  ${t}`);
                    return mustache.render(c, npmrcView);
                }
            );
        }
        //#endregion  

        //#region [6] post commands
        console.log('[6] post commands');
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
