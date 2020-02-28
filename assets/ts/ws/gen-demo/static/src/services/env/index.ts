import { Environment } from './Environment';

import { registerService } from '@/services/registerService';

const env = new Environment();
env.create();
env.check();
env.print();

export { env };
registerService('env', env);
