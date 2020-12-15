import { command, Context, metadata, Options, option } from 'clime'
import * as mustache from 'mustache'
import { resolve, join } from 'path'
import { existsSync } from 'fs'

import { CommandBase } from '../../../base'
import { FS } from '../../../services/fs'
import { TSCode } from '../../../services/ws/tscode/TSCode'
import { TSConverter } from '../../../services/ws/exporters/ts/TSConverter'
import { Shell } from '../../../services/shell'

class CommandOptions extends Options {
    @option( {
        flag: 's',
        required: false,
        description: 'source folder - must contain ws contract server',
    } )
    public source: string;

    @option( {
        flag: 'o',
        required: false,
        description: 'output folder - folder that contains api',
    } )
    public output: string;

    @option( {
        flag: 'x',
        required: false,
        default: '.contract.ts',
        description: 'suffix file, to select posible contracts',
    } )
    public suffix: string;

    @option( {
        flag: 'b',
        default: false,
        required: false,
        toggle: true,
        description: 'execute npm run build after generation',
    } )
    public build: boolean;
}

// tslint:disable-next-line: max-classes-per-file
@command( {
    description: 'Update typescript wsapi client (source files only) from a server source code. !Require @nexjs/wsclient, uuid, socket.io-client, strongly-typed-events as dependencies, and @types/uuid @types/socket.io-client as  devDependencies',
} )
export default class extends CommandBase {

    constructor () {
        super( __filename )
    }

    @metadata
    async execute (
        options: CommandOptions,
        context: Context,
    ): Promise<string> {

        const config = this.getOptions<CommandOptions>( options, options.source ? options.source : context.cwd )
        const cwd = config.source
            ? resolve( options.source )
            : context.cwd

        const assets = this.getAssets()

        //#region [ checks ]
        if ( !existsSync( cwd ) ) {
            throw new Error( `source folder '${cwd}' not found` )
        }

        console.log( '[check] command assets' )
        if ( !assets.exists ) {
            throw new Error( `assets folder for command "nex ${this.commandPath.join( ' ' )}" is missing` )
        }

        console.log( '[check] is typescript project' )
        if ( !existsSync( resolve( cwd, 'tsconfig.json' ) ) ) {
            throw new Error( 'file tsconfig.json not found.' )
        }
        //#endregion

        const target = options.output
            ? resolve( context.cwd, options.output )
            : resolve( context.cwd, config.output )

        //#region [1] Code analysis
        console.log( '[1] code analisis' )
        const tscode = new TSCode( cwd, config.suffix )
        const services = tscode.WSService.convert()
        const dependencies = tscode.getDependencies( services )
        //#endregion

        const ts = new TSConverter()

        //#region [2] create model files
        console.log( '[2] MODELS' )

        console.log( '[2.1] clean models' )
        const modelTarget = join( target, 'models' )
        console.log( `  |- [remove] folder ${modelTarget}` )
        FS.removeFolder( modelTarget )

        console.log( '[2.2] create models' )
        const modelViews = dependencies.map( x => ts.Model.convert( x.declaration ) )
        modelViews.forEach( view => {
            const src = assets.getPath( 'templates/models/model.ts' )
            const dest = join( modelTarget, `${view.name}.ts` )
            FS.copyFile( src, dest, ( s, t, c ) => {
                console.log( `  |- [create]  ${t}` )
                return mustache.render( c, view )
            } )
        } )

        console.log( '[2.3] create index model' )
        const modelsIndexView = ts.ModelIndex.convert( dependencies.map( x => x.declaration ) )
        const modelIndexSource = assets.getPath( 'templates/models/index.ts' )
        const modelIndexTarget = join( target, 'models', 'index.ts' )
        FS.copyFile( modelIndexSource, modelIndexTarget, ( s, t, c ) => {
            console.log( `  |- [create]  ${t}` )
            return mustache.render( c, modelsIndexView )
        } )
        //#endregion

        //#region [3] SERVICES
        console.log( '[3] SERVICES' )
        const serviceViews = services.map( service => ts.WSService.convert( service ) )

        console.log( '[3.1] clean' )
        const apiServicesTarget = join( target, 'api', 'services' )
        console.log( `  |- [remove] folder ${apiServicesTarget}` )
        FS.removeFolder( apiServicesTarget )

        console.log( '[3.2] create wsapi file' )
        const wsapiSource = assets.getPath( 'templates/services/wsapi.ts' )
        const wsapiTarget = join( target, 'api', 'wsapi.ts' )
        const wsapiView = {
            services: serviceViews,
        }
        FS.copyFile( wsapiSource, wsapiTarget, ( s, t, c ) => {
            console.log( `  |- [update]  ${t}` )
            return mustache.render( c, wsapiView )
        } )

        console.log( '[3.3] generate ws services' )
        serviceViews.forEach( view => {
            const src = assets.getPath( 'templates/services/WSService.ts' )
            const dest = join( apiServicesTarget, `${view.serviceUpperName}WSService.ts` )
            FS.copyFile( src, dest, ( s, t, c ) => {
                console.log( `  |- [create]  ${t}` )
                return mustache.render( c, view )
            } )
        } )
        //#endregion

        //#region [4] STATIC FOLDER
        console.log( '[4] copy static folder' )
        const staticSource = assets.getPath( 'static' )
        FS.copyFolder( staticSource, target )
        //#endregion

        //#region [5] post commands
        console.log( '[5] post commands' )
        if ( options.build ) {
            try {
                await Shell.exec( `cd ${target} && npm run build`, { stdout: true, rejectOnError: true } )
            } catch ( err ) {
                console.error( err )
            }
        }
        //#endregion

        return `${this.commandName} finished.`
    }
}
