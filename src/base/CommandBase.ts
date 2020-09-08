import { Command } from 'clime'
import { Assets } from './Assets'
import { basename, resolve, relative } from 'path'
import { existsSync, readFileSync } from 'fs'
import * as upath from 'upath'

export abstract class CommandBase extends Command {

    public readonly filename: string;
    public readonly commandPath: string[];
    public readonly commandName: string;

    constructor ( filename: string ) {
        super()
        this.filename = filename
        this.commandName = basename( filename ).replace( /\.[^/.]+$/, '' )

        const commandsFolderPath = resolve( __dirname, '../commands' )
        const relativePathFromCommandsFolder = upath.normalize( relative( commandsFolderPath, this.filename ) )
        this.commandPath = relativePathFromCommandsFolder.split( '/' )
        const lastIdx = this.commandPath.length - 1
        this.commandPath[lastIdx] = this.commandPath[lastIdx].replace( /\.[^/.]+$/, '' )
    }

    public getOptions<T> ( cmdlineOptions: T, folder: string ): T {
        let fileOptions: T = {} as T
        const nexConfigFilePath = resolve( folder, 'nex-cli.json' )
        if ( existsSync( nexConfigFilePath ) ) {
            const file = readFileSync( nexConfigFilePath, 'utf8' )
            const config = JSON.parse( file ) as T
            let current = config
            for ( const [idx, key] of this.commandPath.entries() ) {
                if ( current[key] ) {
                    current = current[key]
                    if ( idx == this.commandPath.length - 1 ) {
                        fileOptions = current as T
                    }
                } else {
                    break
                }
            }
        }
        return Object.assign( cmdlineOptions, fileOptions )
    }
    public getAssets (): Assets {
        return new Assets( this )
    }
}
