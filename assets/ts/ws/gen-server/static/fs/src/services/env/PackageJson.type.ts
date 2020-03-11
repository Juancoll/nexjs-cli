export class PackageJson {
    name?: string;
    version?: string;
    description?: string;
    author?: string;

    constructor(init: Partial<PackageJson>) {
        this.name = init.name;
        this.version = init.version;
        this.description = init.description;
        this.author = init.author;
    }
}
