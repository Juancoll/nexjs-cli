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
        flag: 'x',
        required: false,
        default: ".contract.ts",
        description: 'suffix file, to select posible contracts',
    })
    public suffix: string;

    @option({
        flag: 'i',
        default: false,
        required: false,
        toggle: true,
        description: 'execute npm install after generation',
    })
    public install: boolean;
}
}

// tslint:disable-next-line: max-classes-per-file
@command({
    description: 'Generate wsapi demo project for typescript context',
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

        //#region [ check ]
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
        const targetLib = join(target, 'src', 'lib', 'ws');
        const targetServiceViews = join(target, 'src', 'views', 'ws', 'services');

        //#region [1] STATIC FOLDER
        console.log('[1] STATIC FOLDER');
        const staticSource = assets.getPath('static');
        FS.copyFolder(staticSource, target);
        //#endregion   

        //#region [2] create lib 
        console.log('[2] create lib');
        // gen lib without package 
        await Shell.exec(`nex ts ws up-client -s ${cwd} -o ${targetLib}`, { stdout: true, rejectOnError: true });
        //#endregion

        //#region [3] Code analysis 
        console.log('[3] code analisis');
        const tscode = new TSCode(cwd, config.suffix);
        const services = tscode.WSService.convert();
        //#endregion

        const ts = new TSConverter();

        //#region [4] Services
        console.log('[4] SERVICES');
        const serviceViews = services.map(service => ts.WSService.convert(service));

        console.log('[4.1] App Service Views');
        serviceViews.forEach(view => {
            const src = assets.getPath('templates/services');
            const dest = join(targetServiceViews, `${view.serviceName}`);
            FS.copyFolder(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return s.endsWith(".pug")
                    ? c
                    : mustache.render(c, view);
            });
        });

        console.log('[4.2] App Routes');
        const routesSource = assets.getPath('templates/routes/defaultRoutes.ts');
        const routesTarget = join(target, 'src', 'router', `defaultRoutes.ts`);
        const routesView = { services: serviceViews }
        FS.copyFile(routesSource, routesTarget, (s, t, c) => {
            console.log(`  |- [create]  ${t}`);
            return mustache.render(c, routesView);
        });
        //#endregion  

        //#region [5] post commands
        console.log('[5] post commands');
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
