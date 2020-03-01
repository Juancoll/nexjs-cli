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
    description: 'Update wsapi client for c# context - only ws files',
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
            const dest = join(target, 'models', `${view.name}.cs`);
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
        const wsapiTarget = join(target, 'api', `WsApi.cs`);
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
            const dest = join(target, 'api', 'services', `${view.serviceUpperName}WSService.cs`);
            FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, view);
            });
        });
        //#endregion

        //#region [4] STATIC  WS LIB FILES
        console.log('[4] STATIC  WS LIB FILES');
        const staticSource = assets.getPath('static');
        FS.copyFolder(staticSource, target);
        //#endregion

        return `${this.commandName} finished.`;
    }
}
