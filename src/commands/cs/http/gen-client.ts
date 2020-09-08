import { metadata, command, Context, option, Options } from 'clime'
import { resolve } from 'upath'
import * as mustache from 'mustache'

import { CommandBase } from '../../../base'
import { Shell } from '../../../services/shell'
import { FS } from '../../../services/fs'

const generatorConfig = {
    packageName: 'none',
    packageVersion: 'none',
    sourceFolder: 'src',
    interfacePrefix: 'I',
    targetFramework: 'v4.5',
    modelPropertyNaming: 'original',
    hideGenerationTimestamp: true,
    sortParamsByRequiredFlag: true,
    useDateTimeOffset: false,
    useCollection: false,
    returnICollection: true,
    optionalMethodArgument: true,
    optionalAssemblyInfo: true,
    optionalEmitDefaultValues: false,
    optionalProjectFile: true,
    generatePropertyChanged: false,
    nonPublicApi: false,
    allowUnicodeIdentifiers: false,
    netCoreProjectFile: false,
    validatable: true,
    useCompareNetObjects: false,
    caseInsensitiveResponseHeaders: false,
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
        required: true,
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
        required: false,
        description: 'private package feed name',
    } )
    public feedName: string;

    @option( {
        required: false,
        description: 'private package feed url',
    } )
    public feedUrl: string;

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
    description: 'Generate cs http client full package.',
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
        const tool = resolve( './node_modules/@openapitools/openapi-generator-cli/bin/openapi-generator' )
        generatorConfig.packageName = config.name
        generatorConfig.packageVersion = config.version

        const additionalProperties = this.toCSV( generatorConfig )
        const inputFile = resolve( cwd, options.source )

        await Shell.exec( `node ${tool} generate -g csharp -i ${inputFile} --skip-validate-spec --enable-post-process-file -o ${target} --additional-properties=${additionalProperties}`, { rejectOnError: true, stdout: true } )
        //#endregion

        //#region [2] private feed
        console.log( '[2] PRIVATE FEED' )
        if ( config.feedName ) {
            const feedSrc = assets.getPath( 'templates/feed' )
            const feedView = {
                namespace: config.name,
                feedName: config.feedName,
                feedUrl: config.feedUrl,
            }
            FS.copyFolder(
                feedSrc,
                target,
                {
                    file: {
                        transform: ( s, t, c ): string => {
                            console.log( `  |- [create]  ${t}` )
                            return mustache.render( c, feedView )
                        },
                    },
                }
            )
        }
        //#endregion

        //#region [3] post commands
        console.log( '[3] post commands' )
        if ( options.build ) {
            try {
                await Shell.exec( `cd ${target} && .\\build.bat`, { stdout: true, rejectOnError: true } )
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