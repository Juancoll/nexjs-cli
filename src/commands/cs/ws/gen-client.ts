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
        required: false,
        description: 'private package feed name',
    })
    public feedName: string;

    @option({
        required: false,
        description: 'private package feed url',
    })
    public feedUrl: string;

    @option({
        flag: 'b',
        default: false,
        required: false,
        toggle: true,
        description: 'execute .\\build.bat ',
    })
    public build: boolean;

    @option({
        flag: 'p',
        default: false,
        required: false,
        toggle: true,
        description: 'execute .\\publish.bat ',
    })
    public publish: boolean;
}

// tslint:disable-next-line: max-classes-per-file
@command({
    description: 'Generate wsapi client for c# context',
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
        console.log('[check] feed options');
        if (config.feedName && !config.feedUrl || !config.feedName && config.feedUrl) {
            throw new Error(`both feeds options must be undefined or defined`);
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

        //#region [1] Code analysis 
        console.log('[1] code analisis');
        const tscode = new TSCode(cwd, config.suffix);
        const services = tscode.WSService.convert();
        const dependencies = tscode.getDependencies(services);
        //#endregion

        const cs = new CSConverter();

        //#region [2] create model files
        console.log('[2] MODELS');

        const modelViews = dependencies.map(x => cs.Model.convert({
            namespace: config.name,
            typeDeclaration: x.declaration,
        }));

        modelViews.forEach(view => {
            const src = assets.getPath('templates/models/model.cs');
            const dest = join(target, 'src', 'models', `${view.name}.cs`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, view);
            });
        });
        //#endregion

        //#region [3] generate ws service files
        console.log('[3] SERVICES');

        const serviceViews = services.map(service => cs.WSService.convert({
            namespace: config.name,
            wsservice: service
        }));

        console.log('[3.1] create wsapi file');
        const wsapiSource = assets.getPath('templates/services/WsApi.cs');
        const wsapiTarget = join(target, 'src', 'api', `WsApi.cs`);
        const wsapiView = {
            namespace: config.name,
            services: serviceViews,
        };
        FS.copyFile(wsapiSource, wsapiTarget, (s, t, c) => {
            console.log(`  |- [create]  ${t}`);
            return mustache.render(c, wsapiView);
        });

        console.log('[3.2] generate ws service');
        serviceViews.forEach(view => {
            const src = assets.getPath('templates/services/WSService.cs');
            const dest = join(target, 'src', 'api', 'services', `${view.serviceUpperName}WSService.cs`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, view);
            });
        });
        //#endregion

        //#region [4] STATIC  WS LIB FILES
        console.log('[4] STATIC  WS LIB FILES');
        const staticSource = assets.getPath('static');
        const staticTarget = join(target);
        FS.copyFolder(staticSource, staticTarget);
        //#endregion

        //#region [5] PACKAGE  FILES
        console.log('[5] PACKAGE  FILES');
        const source = assets.getPath('templates/package');
        const apiView = cs.WSApi.convert({
            name: config.name,
            version: config.version,
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

        //#region [6] private feed
        console.log('[6] PRIVATE FEED');
        if (config.feedName) {
            const feedSrc = assets.getPath('templates/feed');
            const feedView = {
                namespace: config.name,
                feedName: config.feedName,
                feedUrl: config.feedUrl,
            }
            FS.copyFolder(
                feedSrc,
                target,
                (s, t, c) => {
                    console.log(`  |- [create]  ${t}`);
                    return mustache.render(c, feedView);
                }
            );
        }
        //#endregion

        //#region [7] post commands
        console.log('[7] post commands');
        if (options.build) {
            try {
                await Shell.exec(`cd ${target} && .\\build.bat`, { stdout: true, rejectOnError: true });
            } catch (err) {
                console.error(err);
            }
        }
        if (options.publish) {
            try {
                await Shell.exec(`cd ${target} && .\\publish.bat`, { stdout: true, rejectOnError: true });
            } catch (err) {
                console.error(err);
            }
        }
        //#endregion

        return `${this.commandName} finished.`;
    }
}
