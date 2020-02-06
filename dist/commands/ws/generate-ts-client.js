"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const clime_1 = require("clime");
const mustache = require("mustache");
const path_1 = require("path");
const fs_1 = require("fs");
const fs_2 = require("../../services/fs");
const ws_1 = require("../../services/ws");
const base_1 = require("../../base");
const shell_1 = require("../../services/shell");
class CommandOptions extends clime_1.Options {
}
__decorate([
    clime_1.option({
        flag: 'i',
        default: false,
        required: false,
        toggle: true,
        description: 'after, execute npm install',
    }),
    __metadata("design:type", Boolean)
], CommandOptions.prototype, "install", void 0);
__decorate([
    clime_1.option({
        flag: 'b',
        default: false,
        required: false,
        toggle: true,
        description: 'after, execute npm build',
    }),
    __metadata("design:type", Boolean)
], CommandOptions.prototype, "build", void 0);
exports.CommandOptions = CommandOptions;
let default_1 = class default_1 extends base_1.CommandBase {
    constructor() {
        super(__filename);
    }
    async execute(options, context) {
        const config = this.getConfig(context);
        const assets = this.getAssets();
        console.log('[read] read config from nex-cli.json file');
        if (!config.exists) {
            throw new Error(`config not found. create nex-cli.json file and add config for "${this.commandPath.join(' ')}" command.`);
        }
        console.log('[check] command assets');
        if (!assets.exists) {
            throw new Error(`assets folder for command "nex ${this.commandPath.join(' ')}" is missing`);
        }
        console.log('[check] is typescript project');
        if (!fs_1.existsSync(path_1.resolve(context.cwd, 'tsconfig.json'))) {
            throw new Error(`file tsconfig.json not found.`);
        }
        const reflection = new ws_1.WSApiDescriptor(context.cwd, config.value.outDir, config.value.suffix);
        console.log('[step 1] create data view');
        const dataView = {
            config: config.value,
            context: {
                cwd: context.cwd,
                command: this.commandPath.join(' '),
            },
            services: reflection.getServiceDescriptors(),
        };
        console.log('[step 2] generate common files');
        const source = assets.path('out');
        const target = path_1.resolve(context.cwd, config.value.outDir);
        fs_2.FS.copyFolder(source, target, (s, t, c) => {
            console.log(`  |- [create]  ${t}`);
            return mustache.render(c, dataView);
        });
        console.log('[step 3] generate ws service files');
        dataView.services.forEach(item => {
            const src = assets.path('templates/WSService.ts');
            const dest = path_1.join(target, 'src', 'api', 'services', `${item.service.upper}WSService.ts`);
            fs_2.FS.copyFile(src, dest, (s, t, c) => {
                console.log(`  |- [create]  ${t}`);
                return mustache.render(c, item);
            });
        });
        console.log('[step 4] copy models');
        const modelsSource = path_1.resolve(context.cwd, config.value.models.source);
        const modelsTarget = path_1.resolve(config.value.outDir, config.value.models.source);
        console.log(`  |- [source]  ${modelsSource}`);
        console.log(`  |- [target]  ${modelsTarget}`);
        fs_2.FS.copyFolder(modelsSource, modelsTarget, (s, t, c) => {
            console.log(`  |- [create]  ${t}`);
            return c;
        });
        console.log('[step 5] clean *.ts files models (remove imports and decorators)');
        console.log(`  |- [imports]    remove '${config.value.models.importsToRemove.join(',')}'`);
        console.log(`  |- [decorators] remove '${config.value.models.decoratorsToRemove.join(',')}'`);
        const models = new ws_1.Models(target, config.value.models.importsToRemove, config.value.models.decoratorsToRemove);
        models.apply();
        models.save();
        console.log('[step 6] post commands');
        if (options.install) {
            try {
                await shell_1.Shell.exec(`cd ${target} && npm install`, { stdout: true, rejectOnError: true });
            }
            catch (err) {
                console.error(err);
            }
        }
        if (options.build) {
            try {
                await shell_1.Shell.exec(`cd ${target} && npm run build`, { stdout: true, rejectOnError: true });
            }
            catch (err) {
                console.error(err);
            }
        }
        return `${this.commandName} finished.`;
    }
};
__decorate([
    clime_1.metadata,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CommandOptions,
        clime_1.Context]),
    __metadata("design:returntype", Promise)
], default_1.prototype, "execute", null);
default_1 = __decorate([
    clime_1.command({
        description: 'Generate wsapi client for typescript context',
    }),
    __metadata("design:paramtypes", [])
], default_1);
exports.default = default_1;
//# sourceMappingURL=generate-ts-client.js.map