import * as c from 'ansicolor'
import { exec } from 'child_process'

export interface ShellExecOptions {
    stdout: boolean;
    rejectOnError: boolean;
}

export class Shell {
    public static exec ( cmd: string, options: ShellExecOptions ): Promise<string> {
        return new Promise( ( resolve, reject ) => {
            console.log( `${c.magenta( 'start shell command ...' )} ${c.lightGray( cmd )}` )

            exec( cmd, ( error, stdout, stderr ) => {
                if ( options.rejectOnError && error ) {
                    reject( error )
                } else {
                    const result = stdout ? stdout : stderr
                    if ( options.stdout && result ) {
                        console.log( result )
                    }
                    console.log( `${c.magenta( '...end shell command' )} ${c.lightGray( cmd )}` )
                    resolve( result )
                }
            } )
        } )
    }
}