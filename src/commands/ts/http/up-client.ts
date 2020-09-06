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
        flag: 'c',
        required: false,
        description: 'remove temporal folders',
        default: true
    })
    public clean: boolean;
}

@command({
    description: 'Update typescript http api client from swagger description file. only source code files. !Require axios npm package',
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
        const temp = join(tmpdir(), `nexjs-ts-http-up-client-${v1()}`);
        console.log(`temp folder: ${temp}`);

        // [2] execute gen-client command
        console.log('[2] execute gen-client command');
        await Shell.exec(`nexjs ts http gen-client -s ${config.source} -o ${temp}`, { rejectOnError: true, stdout: true });

        // [3] copy api source code files 
        console.log('[3] copy api source code files ');
        FS.copyFolder(
            temp,
            target,
            {
                file: {
                    rename: (folder, file) => {
                        console.log(`  [copy] Folder: ${folder} - File: ${file}`);
                        return file;
                    },
                    include: /.*\.[tT][sS]$/
                },
                folder: {
                    include: /^(?!\.).*/
                }
            },
        )
        // [4] remove temp folder
        if (options.clean) {
            console.log('[4] remove temp folder');
            FS.removeFolder(temp);
        }

        return `${this.commandName} finished.`;
    }
}