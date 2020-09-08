import { Project, Type, PropertyDeclaration, ObjectLiteralExpression, StringLiteral } from 'ts-morph'
import { resolve, join } from 'path'

export interface IRestMethodDescriptor {
    service: {
        name: string;
        upper: string;
    };
    method: string;
    credentials: ITypeDescription;
    arguments: ITypeDescription[];
    returnType: ITypeDescription;
}

export interface IHubEventDescriptor {
    service: {
        name: string;
        upper: string;
    };
    event: string;
    credentials: ITypeDescription;
    data: ITypeDescription;
}
export interface IWSSServiceDescriptor {
    name: string;
    upper: string;
    hub: IHubEventDescriptor[];
    rest: IRestMethodDescriptor[];
    importedTypes: ITypeDescription[];
}

export interface ITypeImport {
    path: string;
    type: string;
}

export interface ITypeDescription {
    isArrayOf?: string;
    text: string;
    import?: ITypeImport;
}

export class WSReflection {
    public importedTypes: ITypeDescription[] = [];
    public hubs: IHubEventDescriptor[] = [];

    setup ( cwd: string, suffix: string ): void {
        const tsconfig = resolve( join( cwd, '/tsconfig.json' ) )
        const project = new Project( {
            tsConfigFilePath: tsconfig,
        } )

        const files = project.getSourceFiles().filter( x => x.getFilePath().endsWith( suffix ) )
        files.forEach( file => {
            file.getClasses().forEach( classObj => {
                classObj.getMethods().forEach( method => {
                    if ( method.getDecorators().find( x => x.getName() == 'Rest' ) ) {
                        console.log( `rest method ${method.getName()}` )
                    }
                } )
                classObj.getProperties().forEach( property => {
                    if ( property.getDecorators().find( x => x.getName() == 'Hub' ) ) {
                        const descriptor = this.getHubDescriptor( property )
                        this.hubs.push( descriptor )
                    }
                } )
            } )
        } )

    }

    public getServiceDescriptors (): IWSSServiceDescriptor[] {
        const result: IWSSServiceDescriptor[] = []
        this.hubs.forEach( hub => {
            const service = result.find( svc => svc.name == hub.service.name )
            if ( !service ) {
                result.push( {
                    name: hub.service.name,
                    upper: hub.service.upper,
                    hub: [hub],
                    rest: [],
                    importedTypes: [],
                } )
            } else {
                service.hub.push( hub )
            }
        } )

        result.forEach( service => {
            const importedTypes: ITypeDescription[] = []

            service.hub.forEach( hub => {
                [hub.credentials, hub.data].forEach( type => {
                    this.importType( importedTypes, type )
                } )
            } )
            service.importedTypes = importedTypes
        } )

        return result
    }

    private importType ( types: ITypeDescription[], type: ITypeDescription ): void {
        if ( type.import && !types.find( x => this.areTypeEquals( x, type ) ) ) {
            types.push( type )
        }
    }
    private areTypeEquals ( a: ITypeDescription, b: ITypeDescription ): boolean {
        return a.import.path == b.import.path && a.import.type == b.import.type
    }

    private getHubDescriptor ( property: PropertyDeclaration ): IHubEventDescriptor {
        const decorator = property.getDecorators().find( x => x.getName() == 'Hub' )

        const serviceDecoratorProperty = ( decorator.getArguments()[0] as ObjectLiteralExpression ).getProperty( 'service' )
        const serviceLiteralValue = ( serviceDecoratorProperty.getChildren()[2] as StringLiteral ).getLiteralValue()

        return {
            event: property.getName(),
            service: {
                name: serviceLiteralValue,
                upper: serviceLiteralValue.replace( /^\w/, c => c.toUpperCase() ),
            },
            credentials: this.getTypeDescriptor( property.getType().getTypeArguments()[0] ),
            data: this.getTypeDescriptor( property.getType().getTypeArguments()[1] ),
        }
    }
    private getTypeDescriptor ( type: Type ): ITypeDescription {
        const text = type.getText()
        const idxFirst = text.lastIndexOf( '("' )
        const idxLast = text.lastIndexOf( '")' )

        let result: ITypeDescription
        if ( text.indexOf( 'import("' ) > -1 ) {
            result = {
                text: text.substr( idxLast + 3 ),
                import: {
                    path: text.substr( idxFirst + 2, idxLast - idxFirst - 2 ),
                    type: type.isArray()
                        ? this.getTypeDescriptor( type.getArrayElementType() ).text
                        : text.substr( idxLast + 3 ),
                },
            }
        } else {
            result = { text }
        }

        if ( result.import && !this.importedTypes.find( x => x.import == result.import ) ) {
            this.importedTypes.push( result )
        }
        return result
    }
}
