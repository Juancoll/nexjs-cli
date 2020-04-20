
import { IAuthUser } from '@/models';
import { Rest, Data, Context } from '@nexjs/wsserver';
import { ContractBase } from './base/ContractBase';
import { Injectable } from '@nestjs/common';

export class OrgType {
    a: string;
    b: boolean;
    constructor(init?: Partial<OrgType>) { Object.assign(this, init); }
}

// tslint:disable-next-line: max-classes-per-file
class Auth {
    async    validate2(user: IAuthUser, credentials: string): Promise<boolean> {
        return user && credentials == '123456';
    }
}

// tslint:disable-next-line: max-classes-per-file
@Injectable()
export class OrgsContract extends ContractBase {
    //#region [ contractBase ]
    public readonly name = 'orgs';
    //#endregion

    //#region [ constructor ]
    constructor() { super(); }
    //#endregion

    //#region [ events ]
    //#endregion

    //#region  [ methods ]
    @Rest({ service: 'org' })
    funcA(
        @Data() options: OrgType,
    ): OrgType {
        this.logger.log('funcC');
        return new OrgType({
            a: 'from func ' + options.a,
            b: !options.b,
        });
    }

    @Rest({ service: 'org', isAuth: true, validation: new Auth().validate2 })
    funcB(
        @Context('credentials') credentials: string,
        @Data('name') a: string,
    ) {
        this.logger.log('funcD', a);
        console.log({ credentials });
        return 'good job';
    }
}
