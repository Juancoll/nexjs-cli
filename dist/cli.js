#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const clime_1 = require("clime");
const cli = new clime_1.CLI('nex', Path.join(__dirname, 'commands'));
const shim = new clime_1.Shim(cli);
shim.execute(process.argv);
//# sourceMappingURL=cli.js.map