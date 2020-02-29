import { resolve, join } from 'upath';
import { Project, SourceFile } from 'ts-morph';

import { RTypeConverter } from './converters/RTypeConverter';
import { WSHubEventConverter } from './converters/WSHubConverter';
import { RTypeDeclarationConverter } from './converters/RTypeDeclarationConverter';
import { WSHRestEventConverter } from './converters/WSRestMethodConverter';
import { WSServicesConverter } from './converters/WSServicesConverter';
import { WSService } from '../models/ws/WSService';
import { RType } from '../models/base/RType';
import { RDependencies } from '../models/base/RDependencies';

export class TSCode {

    //#region [ properties ]
    public readonly sourceDir: string;
    public readonly project: Project;
    public readonly contractFiles: SourceFile[];
    //#endregion

    //#region  [ converters ]
    public readonly RType = new RTypeConverter(this);
    public readonly RTypeDeclaration = new RTypeDeclarationConverter(this);
    public readonly WSHubEvent = new WSHubEventConverter(this);
    public readonly WSRestMethod = new WSHRestEventConverter(this);
    public readonly WSService = new WSServicesConverter(this);
    //#endregion

    constructor(sourceDir: string, suffix: string) {
        this.sourceDir = sourceDir;

        const tsconfig = resolve(join(sourceDir, '/tsconfig.json'));
        this.project = new Project({
            tsConfigFilePath: tsconfig,
        });
        this.contractFiles = this.project
            .getSourceFiles()
            .filter(x => x.getFilePath().endsWith(suffix));
    }

    getDependencies(services: WSService[]): RType[] {
        var dependencies = new RDependencies();

        services.forEach(x => {
            const serviceName = x.name;
            dependencies.addTypes(x.getDependencies())
        });

        return dependencies.get();
    }
}