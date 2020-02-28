import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';

const { isBinary } = require('istextorbinary')

export class FS {

    public static copyFolder(
        source: string,
        target: string,
        transform?: (sourceFile: string, targetFile: string, content: string) => string,
        rename?: (fileName: string) => string,
    ) {
        let entries = [];

        // check if folder needs to be created or integrated
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }

        // copy
        if (fs.lstatSync(source).isDirectory()) {
            entries = fs.readdirSync(source);
            entries.forEach((file) => {
                const curSource = path.join(source, file);
                const curTarget = rename
                    ? path.join(target, rename(file))
                    : path.join(target, file);
                if (fs.lstatSync(curSource).isDirectory()) {
                    FS.copyFolder(curSource, curTarget, transform, rename);
                } else {
                    FS.copyFile(curSource, curTarget, transform);
                }
            });
        }
    }

    public static copyFile(source: string, target: string, transform?: (sourceFile: string, targetFile: string, content: string) => string) {
        FS.createFolder(path.dirname(target));
        var buffer = fs.readFileSync(source);
        if (isBinary(source, buffer)) {
            fs.createReadStream(source).pipe(fs.createWriteStream(target));
        }
        else {
            const contentSource = fs.readFileSync(source, 'utf8');
            try {
                const contentTarget = transform
                    ? transform(source, target, contentSource)
                    : contentSource;
                fs.writeFileSync(target, contentTarget);
            } catch (err) {
                console.log(`error copying file ${source}`, err);
            }
        }
    }

    public static createFolder(source: string) {
        if (!fs.existsSync(source)) {
            fs.mkdirSync(source, { recursive: true });
        }
    }
    public static removeFolder(source: string) {
        rimraf.sync(source);
    }
}
