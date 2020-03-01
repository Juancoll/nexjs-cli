using nex.engineio;
using nex.types;
using nex.websocket;
using System;
using System.Timers;

namespace nex.socketio
{
    public class SocketIO: Emitter
    {        
        #region [ fields ]
        private EngineIO _engineio;
        private Timer _reconnectTimer;
        private int _attemptNumber = 0;
        private bool _isReconnecting;
        private bool _disconnectRequest = false;
        private bool _nspConnectionRequest = false;
        #endregion

        #region [ properties ]
        public string id { get { return _engineio.id; } }
        public string nsp { get; private set; }
        public bool connected { get; private set; }
        public bool disconnected { get { return !connected; } }
        #endregion

        #region [ event ]
        public event EventHandler<EventArgs<SocketIOEvent>> EventReceive;
        #endregion

        public SocketIO(IWebsocket websocket, string url, string nsp = "/", EngineIO.Options options = null)
        {
            if (!nsp.StartsWith("/"))
                throw new Exception("nsp must begin with '/'");

            this.nsp = nsp;
            _engineio = new EngineIO(websocket, url, options);
            _engineio.debug = false;
            _engineio
                .on("ping", data =>
                {
                    this.emit("ping");
                })
                .on("pong", data =>
                {
                    this.emit("pong");
                })
                .on("message", (data) =>
                {               
                    if (data is string)
                    {
                        var packet = new SocketIOPacket(data as string);
                        Logger.Log(string.Format("receive package type = '{0}', data = {1}", packet.Type, data));
                        switch (packet.Type)
                        {
                            case SocketIOPacketType.connect:
                                if (nsp != packet.GetNamespace())
                                {
                                    _nspConnectionRequest = true;
                                    _engineio.send(nsp.CreateNamespaceConnectionPacket().Serialize());
                                }
                                else
                                {
                                    connected = true;
                                    if (_isReconnecting)
                                    {
                                        _isReconnecting = false;
                                        emit("reconnect", _attemptNumber);
                                        emit("connect");
                                    }
                                    else
                                    {
                                        emit("connect");
                                    }
                                }
                                break;

                            case SocketIOPacketType.eventMessage:
                                var e = packet.GetEvent();                                
                                emit(e.Name, e.Data);
                                if (EventReceive != null) EventReceive(this, new EventArgs<SocketIOEvent>(new SocketIOEvent(e.Name, e.Data)));
                                break;

                            case SocketIOPacketType.disconnect:
                                disconnect();
                                break;

                            case SocketIOPacketType.error:
                                if (_nspConnectionRequest)
                                {
                                    _nspConnectionRequest = false;                                    
                                    
                                    if (_isReconnecting)
                                        emit("reconnect_error", packet.Data);
                                    else
                                        emit("connect_error", packet.Data);

                                    _engineio.disconnect();
                                }
                                else
                                {
                                    emit("error", packet.Data);
                                }
                                break;
                        }
                    }
                })
                .on("close", (data) =>
                {
                    connected = false;

                    if (_disconnectRequest)
                    {
                        _disconnectRequest = false;
                        emit("disconnect");
                    }
                    else
                    {
                        if (!_isReconnecting)
                        {
                            emit("connect_error", data);
                        }
                        
                        if (_attemptNumber >= _engineio.options.reconnectionAttempts)
                        {
                            emit("reconnect_failed");
                            emit("disconnect");
                        }
                        else if (_engineio.options.autoConnect)
                        {
                            _isReconnecting = true;
                            if (_attemptNumber > 0)
                            {
                                emit("reconnect_error", data);
                            }
                            _attemptNumber += 1;                            
                            emit("reconnecting", _attemptNumber);
                            _reconnectTimer.Interval = _engineio.options.reconnectionDelay;
                            _reconnectTimer.Start();
                            
                        }
                    }
                })
                .on("error", data =>
                {
                    emit("error", data);
                });            

            _reconnectTimer = new Timer();
            _reconnectTimer.AutoReset = false;
            _reconnectTimer.Elapsed += (s, e) =>
            {                
                _engineio.connect();
            };
     
        }
        public void connect()
        {
            Logger.Log("connect()");
            _isReconnecting = false;
            _reconnectTimer.Stop();
            _attemptNumber = 0;
            _engineio.connect();
        }
        public void disconnect()
        {
            Logger.Log("disconnect()");
            _disconnectRequest = true;
            _reconnectTimer.Stop();
            _engineio.disconnect();
        }
        public void send(string eventName, object data = null)
        {
            _engineio.send(nsp.CreateEventPacket(eventName, data).Serialize());
        }
    }
}
