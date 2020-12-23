import { metadata, command, Context, option, Options } from 'clime'
import { join, resolve } from 'upath'
import * as mustache from 'mustache'

import { CommandBase } from '../../../base'
import { Shell } from '../../../services/shell'
import { FS } from '../../../services/fs'

const generatorConfig = {
    apiPackage: 'api',
    modelPackage: 'models',
    npmName: 'none',
    npmVersion: 'none',
    snapshot: false,
    supportsES6: true,
    withSeparateModelsAndApi: true,
    withInterfaces: false,
    withoutPrefixEnums: false,
    modelPropertyNaming: 'original',
    sortParamsByRequiredFlag: true,
    ensureUniqueParams: true,
    allowUnicodeIdentifiers: false,
    prependFormOrBodyParameters: false,
}

class CommandOptions extends Options {
    @option( {
        flag: 's',
        required: false,
        description: 'source swagger file',
    } )
    public source: string;

    @option( {
        flag: 'o',
        required: false,
        description: 'output folder - where npm package will be created.',
    } )
    public output: string;
    @option( {
        flag: 'n',
        required: false,
        description: 'package name',
    } )
    public name: string;

    @option( {
        flag: 'v',
        required: false,
        default: '0.0.1',
        description: 'package version',
    } )
    public version: string;

    @option( {
        flag: 'f',
        required: false,
        description: 'private package feed',
    } )
    public feed: string;

    @option( {
        flag: 'i',
        default: false,
        required: false,
        toggle: true,
        description: 'after, execute npm install',
    } )
    public install: boolean;

    @option( {
        flag: 'b',
        default: false,
        required: false,
        toggle: true,
        description: 'after, execute npm build',
    } )
    public build: boolean;
}

@command( {
    description: 'Generate typescript http api client (full package) from swagger description file.',
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
        const cwd = context.cwd
        const assets = this.getAssets()
        const target = resolve( cwd, options.output )

        //#region [1] openapi:generator command
        const tool = resolve( './node_modules/.bin/openapi-generator-cli' )
        generatorConfig.npmName = config.name || 'none'
        generatorConfig.npmVersion = config.version || 'none'

        const additionalProperties = this.toCSV( generatorConfig )
        const inputFile = resolve( cwd, options.source )

        await Shell.exec( `${tool} generate -g typescript-axios -i ${inputFile} --skip-validate-spec --enable-post-process-file -o ${target} --additional-properties=${additionalProperties}`, { rejectOnError: true, stdout: true } )
        //#endregion

        //#region [2] copy .npmrc
        if ( config.feed ) {
            console.log( '[2 PRIVATE FEED - copy and parse .npmrc file' )
            if ( !config.name.startsWith( '@' ) ) {
                throw new Error( 'package name must include a namespace to publish it to a private feed' )
            }
            const namespace = config.name.split( '/' )[0]
            const npmrcFileSource = assets.getPath( 'templates/feeds/.npmrc' )
            const npmrcFileTarget = join( target, '.npmrc' )
            const npmrcView = {
                namespace,
                feed: config.feed,
            }
            FS.copyFile(
                npmrcFileSource,
                npmrcFileTarget,
                ( s, t, c ) => {
                    console.log( `  |- [create]  ${t}` )
                    return mustache.render( c, npmrcView )
                }
            )
        }
        //#endregion

        //#region [6] post commands
        console.log( '[6] post commands' )
        if ( options.install ) {
            try {
                await Shell.exec( `cd ${target} && npm install`, { stdout: true, rejectOnError: true } )
            } catch ( err ) {
                console.error( err )
            }
        }

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

    //#region [ private ]
    private toCSV ( value: any ): string {
        const props: string[] = []
        Object.keys( value ).forEach( key => {
            props.push( `${key}=${value[key].toString()}` )
        } )
        return props.join( ',' )
    }
    //#endregion
}