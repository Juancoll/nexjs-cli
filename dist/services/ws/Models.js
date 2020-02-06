"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const upath_1 = require("upath");
class Models {
    constructor(sourceDir, importsToRemove, decoratorsToRemove) {
        this._sourceDir = sourceDir;
        this._importsToRemove = importsToRemove;
        this._decoratorsToRemove = decoratorsToRemove;
        const tsconfig = upath_1.resolve(upath_1.join(sourceDir, '/tsconfig.json'));
        this._project = new ts_morph_1.Project({
            tsConfigFilePath: tsconfig,
        });
    }
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
    removeDecorators(value) {
        value.getDecorators().forEach(decorator => {
            if (this._decoratorsToRemove.indexOf(decorator.getName()) > -1) {
                decorator.remove();
            }
        });
    }
    removeImports(value) {
        value.getImportDeclarations().forEach(x => {
            for (const importToRemove of this._importsToRemove) {
                if (x.getText().indexOf(importToRemove) > -1) {
                    x.remove();
                    break;
                }
            }
        });
    }
}
exports.Models = Models;
//# sourceMappingURL=Models.js.map