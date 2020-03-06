import { WSApi, User } from '@/lib/ws';
import { SocketIOClient, WSErrorCode } from '@/lib/ws/lib';

interface IToken { provider: string; value: string; }

export const wsapi = new WSApi<User, IToken>(new SocketIOClient());

//#region [ debug configuration ]

// [ WS Base ]
wsapi.onWSError.sub(value => {
    const code = WSErrorCode[value.code];
    const msg = value.message;
    console.log(`%c[event][wsapi.ws] onWSError code: '${code}', message: ${msg}`, 'color:red', value);
});

wsapi.ws.onNestJSException.sub(value => console.log(`%c[event][wsapi.ws] onNestJSException`, 'color:fuchsia', value));
wsapi.ws.onNewSocketInstance.sub(() => console.log(`%c[event][wsapi.ws] onNewSocketInstance`, 'color:fuchsia'));
wsapi.ws.onReceive.sub(value => console.log(`%c[event][wsapi.ws] onReceive`, 'color:fuchsia', value));
wsapi.ws.onSend.sub(value => console.log(`%c[event][wsapi.ws] onSend`, 'color:fuchsia', value));
wsapi.ws.onSubscriptionError.sub(value => console.log(`%c[event][wsapi.ws] onSubscriptionError`, 'color:fuchsia', value));

wsapi.ws.onConnectionChange.sub(value => console.log(`%c[event][wsapi.ws] onConnectionChange ${value}`, 'color:fuchsia'));
wsapi.ws.onReconnecting.sub(value => console.log(`%c[event][wsapi.ws] onReconnecting ${value}`, 'color:fuchsia'));
wsapi.ws.onReconnected.sub(value => console.log(`%c[event][wsapi.ws] onReconnected ${value}`, 'color:fuchsia'));
wsapi.ws.onDisconnect.sub(() => console.log(`%c[event][wsapi.ws] onDisconnect`, 'color:fuchsia'));

// [ Auth Client ]
wsapi.auth.onAuthenticateChange.sub(value => console.log(`%c[event][wsapi.auth] onAuthenticate ${value}`, 'color: orange'));

// [ Hub Client ]
wsapi.hub.onReceive.sub(x => console.log(`%c[event][${x.service}.hub] onReceive event '${x.eventName}'`, 'color:aqua', x));
wsapi.hub.onSubscribed.sub(x => console.log(`%c[event][${x.service}.hub] on ${x.method} to '${x.eventName}'`, 'color:blue', x));
wsapi.hub.onSubscriptionError.sub(x => console.log(`%c[event][${x.request.service}.hub] onSubscriptionError`, 'color:red', x));
//#endregion
