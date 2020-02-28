export interface WSMessageEvent {
    data: any;
}
export interface WSCloseEvent {
    code: number;
    reason: string;
    wasClean: boolean;
}

export interface IWSClientSocket {

    // [ constructor ]
    // new (url: string): IWSClientSocket;

    // [ properties ]
    readyState: number;

    // [ events ]
    onopen: () => void;
    onclose: (e: WSCloseEvent) => void;
    onerror: (error: any) => void;
    onmessage: (e: WSMessageEvent) => void;

    // [ methods ]
    close(code: number, reason: string): void;
    send(msg: string): void;
}
