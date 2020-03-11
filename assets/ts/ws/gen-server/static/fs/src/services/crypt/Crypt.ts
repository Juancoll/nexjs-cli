import * as bcrypt from 'bcryptjs';

export class Crypt {

    constructor(private readonly saltRounds: number) { }

    encode(value: string): string {
        return bcrypt.hashSync(value, this.saltRounds);
    }
    compare(value: string, encryptedValue: string): boolean {
        return bcrypt.compareSync(value, encryptedValue);
    }
}
