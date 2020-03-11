import { command, Context, metadata, Options, option } from 'clime';
import * as mustache from 'mustache';
import * as sharp from 'sharp';
import { resolve, join, basename } from 'path';
import { existsSync } from 'fs';

import { CommandBase } from '../../base';
import { FS } from '../../services/fs';
import { Shell } from '../../services/shell';

interface IStyle {
    colors: {
        primary: string;
        secondary: string;
        fg: string;
        bg: string;
    },
    isDark: boolean;
    icon: string;
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
        default: '#ed1e79;#29b6f6;true;default',
        description: 'style in format: [primary;secondary;isDark;icon] > default: "#ed1e79;#29b6f6;true;default"',
    })
    public style: string;

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
        // if (existsSync(target)) {
        //     throw new Error(`output folder already exists.`);
        // }

        console.log('[check] command assets');
        if (!assets.exists) {
            throw new Error(`assets folder for command "nex ${this.commandPath.join(' ')}" is missing`);
        }
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

        //#region [3] STATIC ROOT FOLDER
        console.log('[3] STATIC ROOT FOLDER');
        const staticRoot = assets.getPath('static/root');
        FS.copyFolder(staticRoot, target);
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
        const params = value.split(";");
        if (params.length != 4) {
            throw new Error("Style format error");
        }
        const primary = params[0];
        const secondary = params[1];
        const isDark = params[2] == 'true' ? true : false;
        const fg = isDark ? colors.dark.fg : colors.light.fg;
        const bg = isDark ? colors.dark.bg : colors.light.bg;

        let icon = resolve(params[3]);
        if (!existsSync(icon)) {
            icon = this.getAssets().getPath('images/icon_512.png');
        }
        return {
            colors: {
                primary,
                secondary,
                fg,
                bg
            },
            icon,
            isDark
        }
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
