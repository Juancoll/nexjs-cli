import { WSRestDecoratorOptions } from './decorators/WSRestDecoratorOptions'
import { RParam } from '../base/RParam'
import { RType } from '../base/RType'
import { RDependencies } from '../base/RDependencies'
import { RDecorator } from '../base/RDecorator'

export class WSRestMethod {
    name: string;
    params: RParam[];
    returnType: RType;
    options: WSRestDecoratorOptions;
    decorators: RDecorator[];

    constructor ( init?: Partial<WSRestMethod> ) { Object.assign( this, init ) }

    getDependencies (): RType[] {
        const dependencies = new RDependencies()

        dependencies.addTypes( this.params.map( x => x.type ) )
        dependencies.addType( this.returnType )

        return dependencies.get()
    }
}