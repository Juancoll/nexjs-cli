
import { WSAuthApp } from '@/lib/auth/WSAuthApp';
import { wsapi } from '../wsapi';

export const authApp = new WSAuthApp(wsapi);
