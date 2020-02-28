import { FileUpload } from './FileUpload';

export class UploadManager {

    endpoint: string;
    ws: WebSocket | null = null;

    filesToUpload: FileUpload[] = [];
    uploadingFile: FileUpload | null | undefined = undefined;

    readonly fragmentSize = 1000 * 1000;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    uploadFile(user: string, destination: string, folder: string, file: any, fileId: string, tags: string[] = []): FileUpload {

        const fu = new FileUpload(user, destination, folder, file, fileId, tags);

        if (this.uploadingFile == null) {
            this.uploadingFile = fu;
            this.startUpload();
        } else {
            this.filesToUpload.push(fu);
        }
        return fu;
    }

    cancelAllUploads() {
        if (!this.ws) {
            throw new Error('Websocket is null');
        }

        this.ws.close();
        this.filesToUpload.forEach(element => {
            element.onError(element);
        });
        this.filesToUpload = [];
    }

    private startUpload() {

        if (this.ws == null) {

            this.ws = new WebSocket(this.endpoint);
            const ws = this.ws;
            const that = this;

            ws.onopen = (ev: Event) => {
                that.sendNextFragment();
            };

            ws.onclose = (ev: Event) => {
                // handle close
            };

            ws.onerror = (ev: Event) => {
                // handle error
                this.filesToUpload.forEach(element => {
                    element.onError(element);
                });
            };
        }
    }

    private sendNextFragment() {
        if (!this.ws) {
            throw new Error('Websocket is null');
        }

        let fragmentSize = this.fragmentSize;
        const ws = this.ws;

        if (this.uploadingFile == null) {
            this.getNextFile();
        }

        if (this.uploadingFile == null) {
            // no more files to send
            this.ws = null;
            ws.close();
            return;
        }

        // send next fragment of uploadingFile
        const f = this.uploadingFile;

        console.log('[UploadManager] Sending ' + f.fileId + ' at position ' + f.curPosition + ' of ' + f.file.size);

        if (f.curPosition == -1) {

            // send file info at start
            const fileInfoMsg = JSON.stringify(f.toFileInfo());

            ws.onmessage = (evt: Event) => {
                f.curPosition = 0;
                f.onUploadStart(f);
                this.sendNextFragment();
            };
            ws.send(fileInfoMsg);

            return;
        }

        if (f.curPosition == 0 && f.file.size < fragmentSize) {
            // send file at once
            ws.onmessage = (evt: Event) => {
                f.onProgressUpdate(f);
                f.onUploadFinish(f);
                this.getNextFile();
                this.sendNextFragment();
            };
            ws.send(f.file);
        } else {

            if ((fragmentSize + f.curPosition) >= f.file.size) {

                // send last fragment
                fragmentSize = f.file.size - f.curPosition;
                const slice = f.file.slice(f.curPosition, f.curPosition + fragmentSize);

                f.curPosition += fragmentSize;

                // send last fragment
                ws.onmessage = (evt: Event) => {
                    f.onProgressUpdate(f);
                    f.onUploadFinish(f);
                    this.getNextFile();
                    this.sendNextFragment();
                };
                ws.send(slice);
            } else {

                // send next fragment
                const slice = f.file.slice(f.curPosition, f.curPosition + fragmentSize);

                f.curPosition += fragmentSize;

                // send next fragment
                ws.onmessage = (evt: Event) => {
                    f.onProgressUpdate(f);
                    this.sendNextFragment();
                };
                ws.send(slice);
            }
        }
    }

    private getNextFile() {

        if (this.filesToUpload.length == 0) {
            this.uploadingFile = null;
            return;
        }

        this.uploadingFile = this.filesToUpload.shift();
    }
}
