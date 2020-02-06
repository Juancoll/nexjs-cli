import { command, param, Context, metadata, Command } from 'clime';
import { Config } from '../base/config';

interface IConfig {
    outDir: string;
    version: string;
    wsapiFile: string;
    modelsDir: string;
}

@command({
    description: 'This is a command for printing a greeting message',
})
export default class extends Command {
    @metadata
    execute(
        context: Context,
    ) {
        return `Hello, ${name} from install!`;
    }
}
