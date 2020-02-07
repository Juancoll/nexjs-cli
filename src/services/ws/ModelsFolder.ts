import { Project, DecoratableNode, ModuledNode } from 'ts-morph';
import { join, resolve } from 'upath';

export class ModelsFolder {
    //#region [ fields ]
    private _sourceDir: string;
    private _project: Project;
    private _importsToRemove: string[];
    private _decoratorsToRemove: string[];
    //#endregion

    //#region [ constructor ]
    constructor(sourceDir: string, importsToRemove: string[], decoratorsToRemove: string[]) {
        this._sourceDir = sourceDir;
        this._importsToRemove = importsToRemove;
        this._decoratorsToRemove = decoratorsToRemove;

        const tsconfig = resolve(join(sourceDir, '/tsconfig.json'));
        this._project = new Project({
            tsConfigFilePath: tsconfig,
        });
    }
    //#endregion

    //#region [ public ]
    apply() {
        this._project.getSourceFiles()
            .filter(file => file.getFilePath().indexOf('/src/models/') > -1)
            .forEach(file => {
                this.removeImports(file);
                file.getClasses().forEach(classObj => {
                    this.removeDecorators(classObj);
                    classObj.getProperties().forEach(prop => this.removeDecorators(prop));
                    classObj.getMethods().forEach(method => this.removeDecorators(method));
                });
            });
    }

    save() {
        this._project.saveSync();
    }
    //#endregion

    //#region [ private ]
    private removeDecorators(value: DecoratableNode) {
        value.getDecorators().forEach(decorator => {
            if (this._decoratorsToRemove.indexOf(decorator.getName()) > -1) {
                decorator.remove();
            }
        });
    }
    private removeImports(value: ModuledNode) {
        value.getImportDeclarations().forEach(x => {
            for (const importToRemove of this._importsToRemove) {
                if (x.getText().indexOf(importToRemove) > -1) {
                    x.remove();
                    break;
                }
            }
        });
    }
    //#endregion
}
