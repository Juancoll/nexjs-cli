import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';

const { isBinary } = require('istextorbinary')

export interface CopyFolderOptions {
    file?: {
        rename?: (folderName: string, fileName: string) => string,
        transform?: (sourceFile: string, targetFile: string, content: string) => string,
        include?: RegExp
    }
    folder?: {
        rename?: (folderName: string, fileName: string) => string,
        include?: RegExp
    }
}

export class FS {

    public static copyFolder(
        source: string,
        target: string,
        options?: CopyFolderOptions
    ) {
        let entries = [];

        // check if folder needs to be created or integrated
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }

        // copy
        if (fs.lstatSync(source).isDirectory()) {
            entries = fs.readdirSync(source);
            entries.forEach((name: string) => {
                const curSource = path.join(source, name);

                if (fs.lstatSync(curSource).isDirectory()) {
                    if (options && options.folder && options.folder.include) {
                        if (name.match(options.folder.include)) {
                            const curTarget = options && options.folder && options.folder.rename
                                ? path.join(target, options.folder.rename(source, name))
                                : path.join(target, name);
                            FS.copyFolder(curSource, curTarget, options);
                        }
                    } else {
                        const curTarget = options && options.folder && options.folder.rename
                            ? path.join(target, options.folder.rename(source, name))
                            : path.join(target, name);
                        FS.copyFolder(curSource, curTarget, options);
                    }
                } else {
                    const transform = options && options.file && options.file.transform
                        ? options.file.transform
                        : undefined;
                    if (options && options.file && options.file.include) {
                        if (name.match(options.file.include)) {
                            const curTarget = options && options.file && options.file.rename
                                ? path.join(target, options.file.rename(source, name))
                                : path.join(target, name);
                            FS.copyFile(curSource, curTarget, transform);
                        }
                    }
                    else {
                        const curTarget = options && options.file && options.file.rename
                            ? path.join(target, options.file.rename(source, name))
                            : path.join(target, name);
                        FS.copyFile(curSource, curTarget, transform);
                    }
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
