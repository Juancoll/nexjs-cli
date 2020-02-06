import { TypeDescriptor } from './TypeDescriptor';
export declare class TypesToImport {
    items: TypeDescriptor[];
    addIfRequired(type: TypeDescriptor): boolean;
    exists(type: TypeDescriptor): boolean;
    fillTargetPath(action: (source: string) => string): void;
}
