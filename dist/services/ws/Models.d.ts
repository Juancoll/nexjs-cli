export declare class Models {
    private _sourceDir;
    private _project;
    private _importsToRemove;
    private _decoratorsToRemove;
    constructor(sourceDir: string, importsToRemove: string[], decoratorsToRemove: string[]);
    apply(): void;
    save(): void;
    private removeDecorators;
    private removeImports;
}
