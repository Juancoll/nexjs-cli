import { metadata, command, Context, option, Options } from 'clime';
import { join, resolve } from 'upath';
import { tmpdir } from 'os';
import { v1 } from 'uuid'
import * as mustache from 'mustache';


import { CommandBase } from '../../../base';
import { Shell } from '../../../services/shell';
import { FS } from '../../../services/fs';

class CommandOptions extends Options {
    @option({
        flag: 's',
        required: false,
        description: 'source swagger file',
    })
    public source: string;

    @option({
        flag: 'o',
        required: false,
        description: 'output folder - where npm package will be created.',
    })
    public output: string;

    @option({
        flag: 'n',
        required: true,
        description: 'package name',
    })
    public name: string;

    @option({
        flag: 'c',
        required: false,
        description: 'remove temporal folders',
        default: true
    })
    public clean: boolean;
}

@command({
    description: 'update cs http client api code from server swagger file description. !Require Resharp (v 105.1.0), system.Runtime.Serialization and system.ComponentModel.DataAnnotations packages.',
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
        const cwd = context.cwd;
        const assets = this.getAssets();
        const target = resolve(cwd, options.output);

        // [1] Create a Temp folder
        console.log('[1] Create a Temp folder');
        const temp = join(tmpdir(), `nexjs-cs-http-up-client-${v1()}`);
        console.log(`temp folder: ${temp}`);

        // [2] execute gen-client command
        console.log('[2] execute gen-client command');
        await Shell.exec(`nex cs http gen-client -s ${config.source} -o ${temp} -n ${config.name}`, { rejectOnError: true, stdout: true });

        // [3] copy api source code files 
        console.log('[3] copy api source code files ');
        FS.copyFolder(join(temp, "src", config.name, "Api"), join(target, "Api"), {
            file: {
                rename: (folder, file) => {
                    console.log(`  - Api/${file}`);
                    return file;
                },
            }
        });
        FS.copyFolder(join(temp, "src", config.name, "Client"), join(target, "Client"), {
            file: {
                rename: (folder, file) => {
                    console.log(`  - Client/${file}`);
                    return file;
                },
            }
        });
        FS.copyFolder(join(temp, "src", config.name, "Model"), join(target, "Model"), {
            file: {
                rename: (folder, file) => {
                    console.log(`  - Model/${file}`);
                    return file;
                },
            }
        });

        // [4] remove temp folder
        if (options.clean) {
            console.log('[4] remove temp folder');
            FS.removeFolder(temp);
        }

        return `${this.commandName} finished.`;
    }
}