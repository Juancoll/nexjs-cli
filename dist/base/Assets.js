"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
class Assets {
    constructor(command) {
        const assetsFolderPath = path_1.resolve(__dirname, '../../assets', command.commandPath.join('/'));
        if (fs_1.existsSync(assetsFolderPath)) {
            this.root = assetsFolderPath;
        }
    }
    get exists() {
        return this.root ? true : false;
    }
    path(...args) {
        return path_1.resolve(this.root, ...args);
    }
    readTextFile(...args) {
        return fs_1.readFileSync(this.path(...args), 'utf8');
    }
}
exports.Assets = Assets;
//# sourceMappingURL=Assets.js.map