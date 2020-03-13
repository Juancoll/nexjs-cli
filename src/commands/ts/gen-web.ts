import { command, Context, metadata, Options, option } from 'clime';
import * as mustache from 'mustache';
import * as sharp from 'sharp';
import { resolve, join, basename } from 'path';
import { existsSync } from 'fs';

import { CommandBase } from '../../base';
import { FS } from '../../services/fs';
import { Shell } from '../../services/shell';
import { ParamsParser } from '../../services/parsers/ParamsParser';

interface IStyle {
    primary: string;
    secondary: string;
    dark: boolean;
    icon: string;

    fg: string;
    bg: string;
}

interface IView {
    namespace: string;
    name: string;
    style: IStyle;
}

const colors = {
    dark: {
        fg: "#888",
        bg: "#212121",
    },
    light: {
        fg: "#34384c",
        bg: "#f2f2f2",
    }
};

class CommandOptions extends Options {
    @option({
        flag: 'o',
        required: true,
        description: 'output folder - where npm package are created.',
    })
    public output: string;

    @option({
        required: true,
        description: 'namespace -> full name  = [namespace].web.[name] will be created.',
    })
    public namespace: string;

    @option({
        flag: 'n',
        required: true,
        description: 'name -> full name  = [namespace].web.[name] will be created.',
    })
    public name: string;

    @option({
        flag: 's',
        required: false,
        default: 'primary=#ed1e79;secondary=#29b6f6;accent=#29b6f6;dark=true;icon=default',
        description: 'style in format: primary=[color];secondary=[color];dark=[boolean];icon=path > default: primary=#ed1e79;secondary=#29b6f6;dark=true;icon=default',
    })
    public style: string;

    @option({
        flag: 'f',
        default: false,
        required: false,
        toggle: true,
        description: 'disable protections (folder exists)',
    })
    public force: boolean;

    @option({
        flag: 'i',
        default: false,
        required: false,
        toggle: true,
        description: 'execute npm install after generation',
    })
    public install: boolean;
}

// tslint:disable-next-line: max-classes-per-file
@command({
    description: 'Generate server nestjs project',
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

        const config = this.getOptions<CommandOptions>(options, context.cwd);
        const target = join(resolve(context.cwd, config.output), `${config.namespace}.web.${config.name}`);
        const assets = this.getAssets();

        //#region [ check ]
        console.log('[check] output folder');
        if ( !config.force  && existsSync(target)) {
            throw new Error(`output folder already exists.`);
        }

        console.log('[check] command assets');
        if (!assets.exists) {
            throw new Error(`assets folder for command "nex ${this.commandPath.join(' ')}" is missing`);
        }
        //#endregion

        //#region [0] STATIC ROOT FOLDER
        console.log('[0] STATIC ROOT FOLDER');
        const staticRoot = assets.getPath('static/root');
        FS.copyFolder(staticRoot, target);
        //#endregion   

        //#region [1] TEMPLATE ROOT FOLDER
        console.log('[1] TEMPLATE ROOT FOLDER');
        const templateRoot = assets.getPath('template/root');
        const view: IView = {
            namespace: config.namespace,
            name: config.name,
            style: this.parseStyle(options.style),
        };
        FS.copyFolder(templateRoot, target, (s, t, c) => {
            return mustache.render(c, view);
        });
        //#endregion           

        //#region [2] Create icons 
        console.log('[2] CREATE ICONS');
        try {
            await this.create_icon(view.style.icon, join(target, 'public', 'img'), 16);
            await this.create_icon(view.style.icon, join(target, 'public', 'img'), 32);

            await this.create_icon(view.style.icon, join(target, 'src', 'assets', 'img', 'icons'), 16);
            await this.create_icon(view.style.icon, join(target, 'src', 'assets', 'img', 'icons'), 32);
            await this.create_icon(view.style.icon, join(target, 'src', 'assets', 'img', 'icons'), 256);
        }
        catch (err) {
            console.error(err);
            throw err;
        }
        //#endregion



        //#region [4] post commands
        console.log('[4] post commands');
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

    //#region [ private ]
    parseStyle(value: string): IStyle {
        let style: IStyle = new ParamsParser().parse(value);
        style = Object.assign(style, style.dark ? colors.dark : colors.light);
        style.icon = resolve(style.icon);
        if (!existsSync(style.icon)) {
            style.icon = this.getAssets().getPath('images/icon_512.png');
        }
        return style;
    }
    async create_icon(source: string, output: string, size: number): Promise<void> {
        var file = join(output, `icon_${size.toString()}.png`);
        FS.createFolder(output);
        await sharp(source)
            .resize(size, size)
            .toFile(file);

        console.log(`  |- [create] icon ${file}`);
    }
    //#endregion
}
