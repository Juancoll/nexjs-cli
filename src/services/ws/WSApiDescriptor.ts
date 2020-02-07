import * as Enumerable from 'linq';
import { Project, SourceFile, ClassDeclaration, InterfaceDeclaration, Type } from 'ts-morph';
import { resolve, join, relative } from 'upath';

import { HubDescriptor } from './HubDescriptor';
import { TypesToImport } from './TypesToImport';
import { RestDescriptor } from './RestDescriptor';
import { IServiceName, IBaseTypeToImportDescriptor } from './commons';
import { TypeDescriptor } from './TypeDescriptor';
import { BaseType } from './Models/BaseType';

export interface IServiceDescriptor {
    service: IServiceName;
    hub: HubDescriptor[];
    rest: RestDescriptor[];
    typesToImport: TypesToImport;
}

export class WSApiDescriptor {

    //#region [ fields ]
    private _sourceDir: string;
    private _targetDir: string;
    private _project: Project;
    private _contractFiles: SourceFile[];
    private _hubs: HubDescriptor[] = [];
    private _rests: RestDescriptor[] = [];
    //#endregion

    //#region [ constrcutor ]
    constructor(sourceDir: string, targetDir: string, suffix: string) {
        this._sourceDir = sourceDir;
        this._targetDir = targetDir;

        const tsconfig = resolve(join(sourceDir, '/tsconfig.json'));
        this._project = new Project({
            tsConfigFilePath: tsconfig,
        });
        this._contractFiles = this._project
            .getSourceFiles()
            .filter(x => x.getFilePath().endsWith(suffix));

        this._hubs = this.extractHubs();
        this._rests = this.extractRests();
    }
    //#endregion

    //#region [ public ]
    getServiceDescriptors(): IServiceDescriptor[] {
        const result = new Array<IServiceDescriptor>();

        // [1] hubs
        const linqHub = Enumerable.from(this._hubs);
        const hubGroupByService = linqHub.groupBy(x => x.service.name);
        hubGroupByService.forEach(group => {
            const key = group.key();
            const value = group.toArray();
            const typesToImport = new TypesToImport();

            value.forEach(x => {
                typesToImport.addIfRequired(x.credentials);
                typesToImport.addIfRequired(x.data);
            });

            result.push({
                service: {
                    name: key,
                    upper: key.replace(/^\w/, c => c.toUpperCase()),
                },
                hub: value,
                rest: [],
                typesToImport,
            });
        });

        // [2] Rests
        const linqRest = Enumerable.from(this._rests);
        const restGroupByService = linqRest.groupBy(x => x.service.name);
        restGroupByService.forEach(group => {
            const key = group.key();
            const value = group.toArray();

            const existingImport = result.find(x => x.service.name == key);
            if (result.find(rest => rest.service.name == key)) {
                value.forEach(rest => {
                    existingImport.typesToImport.addIfRequired(rest.returnType);
                    rest.params.forEach(param => existingImport.typesToImport.addIfRequired(param.type));
                });
                existingImport.rest = value;
            } else {
                const typesToImport = new TypesToImport();
                value.forEach(rest => {
                    typesToImport.addIfRequired(rest.returnType);
                    rest.params.forEach(param => typesToImport.addIfRequired(param.type));
                });
                result.push({
                    service: {
                        name: key,
                        upper: key.replace(/^\w/, c => c.toUpperCase()),
                    },
                    hub: [],
                    rest: value,
                    typesToImport,
                });
            }
        });

        // [3] Fill imported type target path
        result.forEach(service => {
            service.typesToImport.fillTargetPath((source) => {
                const relativePath = relative(this._sourceDir, source);
                const path = relativePath.replace('src/', '../../');
                return path;
            });
        });

        return result;
    }
    getTypeDescriptorsToImport() {
        const descriptors = this.getServiceDescriptors();
        const types = new TypesToImport();
        descriptors.forEach(descriptor => {
            descriptor.typesToImport.items.forEach(type => {
                types.addIfRequired(type);
            });
        });
        return types.items;
    }
    getBaseTypesToImport(): BaseType[] {
        const types = this.getTypeDescriptorsToImport().map(x => new BaseType(x.tsType));
        return BaseType.getTypesToImports(...types);
    }
    getModelToImportDescriptors(): IBaseTypeToImportDescriptor[] {
        const result = new Array<IBaseTypeToImportDescriptor>();
        const types = this.getBaseTypesToImport();
        console.log(types);
        types.forEach(t => {
            try {
                const filePath = t.importFile + '.ts';
                const file = this._project.getSourceFile(filePath);
                if (!file) {
                    throw new Error(`file "${filePath}" not found.`);
                }
                const c = file.getClasses().find(x => x.getName() == t.textType);
                const i = file.getInterfaces().find(x => x.getName() == t.textType);
                result.push({
                    baseType: t,
                    file,
                    isClass: c ? true : false,
                    isInterface: i ? true : false,
                    declaration: c ? c : i,
                    name: t.textType,
                });
            } catch (err) {
                console.error(err.message);
            }

        });
        return result;
    }
    //#endregion

    //#region [ private ]
    private extractAllTypesFromType(type: Type): TypeDescriptor[] {
        let result = new Array<TypeDescriptor>();
        type.getBaseTypes().forEach(x => {
            result.push(new TypeDescriptor(x));
        });
        type.getProperties().forEach(x => {
            result.push(new TypeDescriptor(x.getDeclaredType()));
        });
        result = result.filter(x => x.import);
        return result;
    }
    private extractAllTypesFromClass(value: ClassDeclaration): TypeDescriptor[] {
        let result = new Array<TypeDescriptor>();
        value.getBaseTypes().forEach(x => result.push(new TypeDescriptor(x)));
        value.getProperties().forEach(x => result.push(new TypeDescriptor(x.getType())));
        result = result.filter(x => x.import);
        return result;
    }
    private extractTypesFromInterface(value: InterfaceDeclaration): TypeDescriptor[] {
        let result = new Array<TypeDescriptor>();
        value.getExtends().forEach(x => result.push(new TypeDescriptor(x.getType())));
        value.getProperties().forEach(x => result.push(new TypeDescriptor(x.getType())));
        result = result.filter(x => x.import);
        return [];

    }
    private extractHubs(): HubDescriptor[] {
        const result = new Array<HubDescriptor>();
        this._contractFiles.forEach(file => {
            file.getClasses().forEach(classObj => {
                classObj.getProperties().forEach(property => {
                    if (HubDescriptor.isHub(property)) {
                        const descriptor = new HubDescriptor(property);
                        result.push(descriptor);
                    }
                });
            });
        });
        return result;
    }
    private extractRests(): RestDescriptor[] {
        const result = new Array<RestDescriptor>();
        this._contractFiles.forEach(file => {
            file.getClasses().forEach(classObj => {
                classObj.getMethods().forEach(method => {
                    if (RestDescriptor.isRest(method)) {
                        const descriptor = new RestDescriptor(method);
                        result.push(descriptor);
                    }
                });
            });
        });
        return result;
    }
    //#endregion
}
