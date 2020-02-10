using System.Collections.Generic;
using WebSocketSharp;
using WebSocketSharp.Net;

namespace template.api.wsclient { 
public class WSException {
    public string status { get; set; }
        public string message { get; set; }
}

public class WSWebsocket : WSBase {

        class RequestItem
        {
            public bool pending { get; set; }
            public object response { get; set; }
        }

        #region [ fields ]
        private Dictionary<string, RequestItem> _requests = new Dictionary<string, RequestItem>();
        private WebSocket _socket;
        #endregion

        #region [ properties ]
        public bool debugPingPong { get; set; }
        public string nameSpace { get; }
        public int defaultRequestTimeout { get; set; }

        public string baseUrl { get; private set; }
        public string path { get; private set; }
        public string url { 
            get
            {
                if (this.baseUrl == null || this.nameSpace == null) { return null; }

                return $"{this.baseUrl}{this.nameSpace}";
            } 
        }
        public bool isConnected
        {
            get { return this._socket != null && this._socket.ReadyState == WebSocketState.Open; }
        }
        public string id {
            get
            {
                return this._socket != null 
                    ? this._socket.
                    : null;
            }
        }
        #endregion

        #region  [ constructor ]
        public WSWebsocket(string nameSpace)
        : base("WSWebsocket")
        {
            this.debugPingPong = false;
            this.nameSpace = nameSpace;
            this.defaultRequestTimeout = 3000;
        }
        #endregion


    //#region  [ properties ]
 

   
    //#endregion

    //#region  [ events ]
    public onConnectionChange = new SimpleEventDispatcher<boolean>();
    public onConnect = new SignalDispatcher();
    public onConnectError = new SimpleEventDispatcher<Error>();
    public onConnectTimeout = new SimpleEventDispatcher<number>();
    public onDisconnect = new SimpleEventDispatcher<string>();
    public onReconnect = new SimpleEventDispatcher<number>();
    public onReconnecting = new SimpleEventDispatcher<number>();
    public onReconnectError = new SimpleEventDispatcher<Error>();
    public onReconnectFailed = new SignalDispatcher();
    public onPing = new SignalDispatcher();
    public onPong = new SignalDispatcher();
    public onException = new SimpleEventDispatcher<IWSException>();
    public onInitilized = new SignalDispatcher();
    //#endregion



//#region  [ public ]
public connect(baseUrl: string, path: string, authToken?: string) : void {
        this._baseUrl = baseUrl;
        this._path = path;

        if (!this.url) { throw new Error('baseUrl or path are undefined'); }

        const options: SocketIOClient.ConnectOpts = { path: this.path };
        if (authToken) {
    options.query = `auth_token =${ authToken}`;
}

        this._socket = io(this.url, options);

        const self = this;
        this._socket.on('connect', () => {
    self.log('connect');
    self.onConnect.dispatch();
    self.onConnectionChange.dispatch(true);
});
        this._socket.on('connect_error', (err: Error) => {
    self.log('connect_error', err);
    self.onConnectError.dispatch(err);
});
        this._socket.on('connect_timeout', (timeout: any) => {
    self.log('connect_timeout', timeout);
    self.onConnectTimeout.dispatch(timeout);
});
        this._socket.on('disconnect', (reason: any) => {
    self.log('disconnect', reason);
    self.onDisconnect.dispatch(reason);
    self.onConnectionChange.dispatch(false);
});
        this._socket.on('reconnect', (attemptNumber: any) => {
    self.log('reconnect', attemptNumber);
    self.onReconnect.dispatch(attemptNumber);
});
        this._socket.on('reconnecting', (attemptNumber: any) => {
    this.log('reconnecting', attemptNumber);
    this.onReconnecting.dispatch(attemptNumber);
});
        this._socket.on('reconnect_error', (err: any) => {
    self.log('reconnect_error', err);
    self.onReconnectError.dispatch(err);
});
        this._socket.on('reconnect_failed', () => {
    self.log('reconnect_failed');
    self.onReconnectFailed.dispatch();
});
        this._socket.on('ping', () => {
    if (self.debugPingPong) { self.log('ping'); }
    self.onPing.dispatch();
});
        this._socket.on('pong', () => {
    if (self.debugPingPong) { self.log('pong'); }
    self.onPong.dispatch();
});
        this._socket.on('exception', (err: IWSException) => {
    self.log('exception', err);
    self.onException.dispatch(err);
});

        this.onInitilized.dispatch();
}
public disconnect() : void {
        this._socket.disconnect();
    }
//#endregion

//#region  [ protected ]
public async requestAsync<T = void>(event: string, data?: any, timeout?: number): Promise<T> {

    if (!this.socket) { throw new Error(`socket is not connected`); }
    const self = this;
    // event not registered in socket
    if (!this._requests[event]) {
        // register request
        this._requests[event] = { pending: false, response: undefined };
        this.socket.on(event, (response: any) => {
            self.log(event, response);
            if (!self._requests[event].pending) {
                self.error(event, `no request pending`);
            } else {
                this._requests[event].pending = false;
                self._requests[event].response = response;
            }
        });
    } else {
        // a request is already pending
        if (this._requests[event].pending) {
            throw new Error('request already pending');
        }
    }
    this._requests[event].pending = true;
    this.socket.emit(event, data);

    return new Promise<T>(async (resolve, reject) => {
        const start = new Date().getTime();
        let time = 0;
        if (!timeout) {
            timeout = this.defaultRequestTimeout;
        }
        while (this._requests[event].pending && time < timeout) {
            await this.wait(16);
            time = new Date().getTime() - start;
        }
        if (time >= timeout) {
            this._requests[event].pending = false;
            reject(new Error('request timeout'));
        } else {
            this._requests[event].pending = false;
            const response = this._requests[event].response;
            resolve(response as T);
        }
    });
}
    public subscribe(event: string, action: (data: any) => void) {
        this.socket.on(event, (data: any) => {
    this.log(event, data);
    try {
        action(data);
    } catch (err) {
        this.error(event, err);
    }
});
}
public publish(event: string, data?: any) {
    this.log(event, data);
    this.socket.emit(event, data);
}
//#endregion
}
}
