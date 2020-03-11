export interface IDBProvider {
    connect(): Promise<void>;
    removeCollection(name: string): Promise<boolean>;
}
