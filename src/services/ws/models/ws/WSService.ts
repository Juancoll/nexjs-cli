import { WSHubEvent } from './WSHubEvent'
import { WSRestMethod } from './WSRestMethod'
import { RType } from '../base/RType'
import { RDependencies } from '../base/RDependencies'

export class WSService {
    //#region [ properties ]
    public name: string;
    public hubEvents: WSHubEvent[];
    public restMethods: WSRestMethod[];
    //#endregion

    //#endregion [ constructor ]
    constructor ( name: string ) {
        this.name = name
        this.hubEvents = []
        this.restMethods = []
    }
    //#endregion

    //#region [ public ]
    addHub ( values: WSHubEvent[] ): void{
        if ( values ) {
            values.forEach( x => {
                if ( x.options.service == this.name ) {
                    this.hubEvents.push( x )
                }
            } )
        }
    }
    addRest ( values: WSRestMethod[] ): void {
        if ( values ) {
            values.forEach( x => {
                if ( x.options.service == this.name ) {
                    this.restMethods.push( x )
                }
            } )
        }
    }

    getDependencies (): RType[] {
        const dependencies = new RDependencies()

        this.hubEvents.forEach( x => dependencies.addTypes( x.getDependencies() ) )
        this.restMethods.forEach( x => dependencies.addTypes( x.getDependencies() ) )

        return dependencies.get()
    }
    //#endregion
}