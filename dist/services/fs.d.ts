export declare class FS {
    static copyFolder(source: string, target: string, transform?: (sourceFile: string, targetFile: string, content: string) => string): void;
    static copyFile(source: string, target: string, transform?: (sourceFile: string, targetFile: string, content: string) => string): void;
}
