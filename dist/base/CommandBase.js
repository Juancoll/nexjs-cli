"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clime_1 = require("clime");
const config_1 = require("./config");
const Assets_1 = require("./Assets");
const path_1 = require("path");
const upath = require("upath");
class CommandBase extends clime_1.Command {
    constructor(filename) {
        super();
        this.filename = filename;
        this.commandName = path_1.basename(filename).replace(/\.[^/.]+$/, '');
        const commandsFolderPath = path_1.resolve(__dirname, '../commands');
        const relativePathFromCommandsFolder = upath.normalize(path_1.relative(commandsFolderPath, this.filename));
        this.commandPath = relativePathFromCommandsFolder.split('/');
        const lastIdx = this.commandPath.length - 1;
        this.commandPath[lastIdx] = this.commandPath[lastIdx].replace(/\.[^/.]+$/, '');
    }
    getConfig(context) {
        return new config_1.Config(this, context);
    }
    getAssets() {
        return new Assets_1.Assets(this);
    }
}
exports.CommandBase = CommandBase;
//# sourceMappingURL=CommandBase.js.map