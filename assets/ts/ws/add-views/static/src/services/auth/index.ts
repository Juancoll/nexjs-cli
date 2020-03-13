import { WSAuthApp } from './WSAuthApp';
import { wsapi } from '../wsapi';

export const authApp = new WSAuthApp(wsapi);

// import { NoAuthApp } from './NoAuthApp';
// export const authApp = new NoAuthApp();
