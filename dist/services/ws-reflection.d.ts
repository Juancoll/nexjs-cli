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
export declare class WSReflection {
    importedTypes: ITypeDescription[];
    hubs: IHubEventDescriptor[];
    setup(cwd: string, suffix: string): void;
    getServiceDescriptors(): IWSSServiceDescriptor[];
    private importType;
    private areTypeEquals;
    private getHubDescriptor;
    private getTypeDescriptor;
}
