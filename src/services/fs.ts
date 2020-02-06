import * as fs from 'fs';
import * as path from 'path';

export class FS {

    public static copyFolder(source: string, target: string, transform?: (sourceFile: string, targetFile: string, content: string) => string) {
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
                const curTarget = path.join(target, file);
                if (fs.lstatSync(curSource).isDirectory()) {
                    FS.copyFolder(curSource, curTarget, transform);
                } else {
                    FS.copyFile(curSource, curTarget, transform);
                }
            });
        }
    }

    public static copyFile(source: string, target: string, transform?: (sourceFile: string, targetFile: string, content: string) => string) {
        FS.createFolder(path.dirname(target));
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

    public static createFolder(source: string) {
        if (!fs.existsSync(source)) {
            fs.mkdirSync(source, { recursive: true });
        }
    }
}
