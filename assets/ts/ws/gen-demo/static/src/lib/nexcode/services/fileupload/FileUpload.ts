import { IFileInfo } from './IFileInfo';
export class FileUpload {
    file: any;
    user: string;
    destination: string;
    folder: string;
    fileId: string;
    progress: number = 0;
    dataTransfered: string = '';
    hasStarted: boolean = false;
    curPosition: number = -1;
    tags: string[] = [];
    onUploadStart: (fileUpload: FileUpload) => void = () => { /* empty */ };
    onUploadFinish: (fileUpload: FileUpload) => void = () => { /* empty */ };
    onError: (fileUpload: FileUpload) => void = () => { /* empty */ };
    onProgressUpdate: (fileUpload: FileUpload) => void = () => { /* empty */ };
    constructor(user: string, destination: string, folder: string, file: any, fileId: string, tags: string[]) {
        this.destination = destination;
        this.folder = folder;
        this.user = user;
        this.file = file;
        this.fileId = fileId;
        this.tags = tags;
    }
    public cancel() { /* empty */ }
    public toFileInfo() {
        return {
            user: this.user,
            destination: this.destination,
            folder: this.folder,
            fileId: this.fileId,
            filename: this.file.name,
            size: this.file.size,
            type: this.file.type,
            lastModifiedDate: this.file.lastModifiedDate,
            tags: this.tags,
        } as IFileInfo;
    }
}
