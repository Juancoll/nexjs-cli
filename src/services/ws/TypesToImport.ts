import { TypeDescriptor } from './TypeDescriptor';

export class TypesToImport {
    public items: TypeDescriptor[] = [];

    addIfRequired(type: TypeDescriptor): boolean {
        if (!type.import) {
            return false;
        } else {
            if (!this.exists(type)) {
                this.items.push(type);
                return true;
            }
        }
    }

    exists(type: TypeDescriptor): boolean {
        return this.items.find(x => {
            return x.import.sourcePath == type.import.sourcePath &&
                x.import.strType == type.import.strType;
        }) ? true : false;
    }

    fillTargetPath(action: (source: string) => string): void {
        this.items.forEach(x => x.import.targetPath = action(x.import.sourcePath));
    }
}
