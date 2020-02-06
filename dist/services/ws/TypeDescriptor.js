"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TypeDescriptor {
    constructor(type) {
        this.tsType = type;
        this.isArray = type.isArray();
        this.import = this.extractImportDescriptor(type);
        this.strType = this.extractStringType(type);
    }
    get requireImport() {
        return this.tsType.getText().indexOf('import("') > -1;
    }
    extractImportDescriptor(type) {
        if (!this.requireImport) {
            return undefined;
        }
        else {
            const text = type.getText();
            const idxFirst = text.lastIndexOf('("');
            const idxLast = text.lastIndexOf('")');
            return {
                strType: type.isArray()
                    ? this.extractImportDescriptor(type.getArrayElementType()).strType
                    : text.substr(idxLast + 3),
                sourcePath: text.substr(idxFirst + 2, idxLast - idxFirst - 2),
            };
        }
    }
    extractStringType(type) {
        if (!this.requireImport) {
            return type.getText();
        }
        else {
            const text = type.getText();
            const idxLast = text.lastIndexOf('")');
            return text.substr(idxLast + 3);
        }
    }
}
exports.TypeDescriptor = TypeDescriptor;
//# sourceMappingURL=TypeDescriptor.js.map