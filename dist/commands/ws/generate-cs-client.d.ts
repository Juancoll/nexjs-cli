import { Context, Command } from 'clime';
export default class extends Command {
    execute(name: string, context: Context): string;
}
