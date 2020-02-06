"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
class FS {
    static copyFolder(source, target, transform) {
        let entries = [];
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }
        if (fs.lstatSync(source).isDirectory()) {
            entries = fs.readdirSync(source);
            entries.forEach((file) => {
                const curSource = path.join(source, file);
                const curTarget = path.join(target, file);
                if (fs.lstatSync(curSource).isDirectory()) {
                    FS.copyFolder(curSource, curTarget, transform);
                }
                else {
                    FS.copyFile(curSource, curTarget, transform);
                }
            });
        }
    }
    static copyFile(source, target, transform) {
        const contentSource = fs.readFileSync(source, 'utf8');
        try {
            const contentTarget = transform
                ? transform(source, target, contentSource)
                : contentSource;
            fs.writeFileSync(target, contentTarget);
        }
        catch (err) {
            console.log(`error copying file ${source}`, err);
        }
    }
}
exports.FS = FS;
//# sourceMappingURL=fs.js.map