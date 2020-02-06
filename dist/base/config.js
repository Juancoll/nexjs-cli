"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
class Config {
    constructor(command, context) {
        const nexConfigFilePath = path_1.resolve(context.cwd, 'nex-cli.json');
        if (fs_1.existsSync(nexConfigFilePath)) {
            const file = fs_1.readFileSync(nexConfigFilePath, 'utf8');
            const config = JSON.parse(file);
            let current = config;
            for (const [idx, key] of command.commandPath.entries()) {
                if (current[key]) {
                    current = current[key];
                    if (idx == command.commandPath.length - 1) {
                        this.value = current;
                    }
                }
                else {
                    break;
                }
            }
        }
    }
    get exists() {
        return this.value ? true : false;
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map