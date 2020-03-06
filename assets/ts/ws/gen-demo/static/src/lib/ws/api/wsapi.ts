import { WSApiBase } from '../lib';

import { DemoWSService } from './services/DemoWSService';
import { CustomWSService } from './services/CustomWSService';
import { DbWSService } from './services/DbWSService';
import { JobsWSService } from './services/JobsWSService';
import { OrgsWSService } from './services/OrgsWSService';
import { UsersWSService } from './services/UsersWSService';

export class WSApi<TUser, Token> extends WSApiBase<TUser, Token> {
    public readonly demo = new DemoWSService(this.rest, this.hub);
    public readonly custom = new CustomWSService(this.rest, this.hub);
    public readonly db = new DbWSService(this.rest, this.hub);
    public readonly jobs = new JobsWSService(this.rest, this.hub);
    public readonly orgs = new OrgsWSService(this.rest, this.hub);
    public readonly users = new UsersWSService(this.rest, this.hub);
}
