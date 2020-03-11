export interface IAuthUser {
    _id: string;
    email: string;
    password?: string;
    roles: string[];
}
