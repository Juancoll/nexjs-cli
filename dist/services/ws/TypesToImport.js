"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TypesToImport {
    constructor() {
        this.items = [];
    }
    addIfRequired(type) {
        if (!type.import) {
            return false;
        }
        else {
            if (!this.exists(type)) {
                this.items.push(type);
                return true;
            }
        }
    }
    exists(type) {
        return this.items.find(x => {
            return x.import.sourcePath == type.import.sourcePath &&
                x.import.strType == type.import.strType;
        }) ? true : false;
    }
    fillTargetPath(action) {
        this.items.forEach(x => x.import.targetPath = action(x.import.sourcePath));
    }
}
exports.TypesToImport = TypesToImport;
//# sourceMappingURL=TypesToImport.js.map