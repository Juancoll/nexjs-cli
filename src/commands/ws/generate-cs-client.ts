import { command, param, Context, metadata, Command } from 'clime';

interface IConfig {
    param: string;
}

@command({
    description: 'This is a command for printing a greeting message',
})
export default class extends Command {
    @metadata
    execute(
        @param({
            description: 'Your loud name',
            required: true,
        })
        name: string,
        context: Context,
    ) {
        return `Hello, ${name} from create-cs-client!`;
    }
}
