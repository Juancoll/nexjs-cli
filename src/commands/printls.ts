import { Command, command, param, Context } from 'clime';

@command({
    description: 'This is a command for printing a greeting message',
})
export default class extends Command {
    execute(
        @param({
            description: 'Your loud name',
            required: true,
        })
        name: string,
        context: Context,
    ) {
        console.log(context);
        return `Hello, ${name} from print!`;
    }
}
