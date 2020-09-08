import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'
import { CommandBase } from './CommandBase'

export class Assets {
    public readonly root: string;
    public get exists (): boolean {
        return this.root ? true : false
    }
    constructor ( command: CommandBase ) {

        const assetsFolderPath = resolve( __dirname, '../../assets', command.commandPath.join( '/' ) )
        if ( existsSync( assetsFolderPath ) ) {
            this.root = assetsFolderPath
        }
    }

    public getPath ( ...args: string[] ): string {
        return resolve( this.root, ...args )
    }
    public readTextFile ( ...args: string[] ): string {
        return readFileSync( this.getPath( ...args ), 'utf8' )
    }
}
