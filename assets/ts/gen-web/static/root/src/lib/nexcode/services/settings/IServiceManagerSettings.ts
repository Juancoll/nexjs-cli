export interface ITag {
    key: string;
    color: string;
    description: string;
}

export interface ILogVisibility {
    log: boolean;
    warn: boolean;
    error: boolean;
}

export interface IServiceManagerServiceSettings {
    tags: string[];
    type: string;
    instanceName: string;
    instanceDescription: string;
    isAutoRun: boolean;
    settingsFolder: string;
    logVisibility: ILogVisibility;
}

export interface IServiceManagerSettings {
    tags: ITag[];
    services: IServiceManagerServiceSettings[];
}
