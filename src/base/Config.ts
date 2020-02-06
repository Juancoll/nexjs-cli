import { resolve, relative } from 'path';
import { existsSync, readFileSync } from 'fs';
import { Context } from 'clime';
import { CommandBase } from './CommandBase';


export class Config<T> {
    public readonly value: T;
    public get exists() {
        return this.value ? true : false;
    }

    constructor(command: CommandBase, context: Context) {
        const nexConfigFilePath = resolve(context.cwd, 'nex-cli.json');
        if (existsSync(nexConfigFilePath)) {
            const file = readFileSync(nexConfigFilePath, 'utf8');
            const config = JSON.parse(file) as T;
            let current = config;
            for (const [idx, key] of command.commandPath.entries()) {
                if (current[key]) {
                    current = current[key];
                    if (idx == command.commandPath.length - 1) {
                        this.value = current;
                    }
                } else {
                    break;
                }
            }
        }
    }
}
