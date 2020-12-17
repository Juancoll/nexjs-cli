import { resolve, join } from 'upath'
import { Project, SourceFile } from 'ts-morph'

import { RTypeConverter } from './converters/RTypeConverter'
import { WSHubEventConverter } from './converters/WSHubEventConverter'
import { RTypeDeclarationConverter } from './converters/RTypeDeclarationConverter'
import { WSHRestMethodConverter } from './converters/WSRestMethodConverter'
import { WSServicesConverter } from './converters/WSServicesConverter'
import { WSService } from '../models/ws/WSService'
import { RType } from '../models/base/RType'
import { RDependencies } from '../models/base/RDependencies'

export class TSCode {

    //#region [ properties ]
    public readonly sourceDir: string;
    public readonly project: Project;
    public readonly contractFiles: SourceFile[];
    //#endregion

    //#region  [ converters ]
    public readonly RType = new RTypeConverter( this );
    public readonly RTypeDeclaration = new RTypeDeclarationConverter( this );
    public readonly WSHubEvent = new WSHubEventConverter( this );
    public readonly WSRestMethod = new WSHRestMethodConverter( this );
    public readonly WSService = new WSServicesConverter( this );
    //#endregion

    constructor ( sourceDir: string, suffix: string ) {
        this.sourceDir = sourceDir

        const tsconfig = resolve( join( sourceDir, '/tsconfig.json' ) )
        this.project = new Project( {
            tsConfigFilePath: tsconfig,
        } )
        this.contractFiles = this.project
            .getSourceFiles()
            .filter( x => x.getFilePath().endsWith( suffix ) )
    }

    getDependencies ( services: WSService[] ): RType[] {
        const dependencies = new RDependencies()

        services.forEach( x => {
            dependencies.addTypes( x.getDependencies() )
        } )

        this.getIncludedModels().forEach( x => {
            dependencies.addType( x )
        } )
        return dependencies.get()
    }
    getIncludedModels (): RType[] {
        const dependencies = new RDependencies()

        this.project.getSourceFiles().forEach( file => {
            file.getClasses().forEach( classDec => {
                const decorator = classDec.getDecorators().find( d => d.getName() == 'IncludeModel' )
                if ( decorator ) {
                    console.log( classDec.getName() )
                    console.log( decorator.getName() )
                    dependencies.addType( this.RType.convert( classDec.getType() ) )
                }
            } )
        } )
        return dependencies.get()
    }
}