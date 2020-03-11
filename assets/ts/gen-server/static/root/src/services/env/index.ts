import { Environment } from './Environment';

// tslint:disable-next-line: no-var-requires
require('dotenv-flow').config();

const env = new Environment();
env.create();
env.check();
env.print();

export { env };
export * from './packageJson.type';
