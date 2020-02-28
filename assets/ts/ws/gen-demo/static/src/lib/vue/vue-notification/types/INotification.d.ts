export interface INotification {
    group?: string;
    type?: "primary" | "success" | "error" | "warn";
    title?: string;
    text: string;
    duration?: number;
    speed?: number;
    data?: object;
}

