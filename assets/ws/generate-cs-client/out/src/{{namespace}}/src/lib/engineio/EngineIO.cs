using nex.types;
using nex.websocket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;

namespace nex.engineio
{
    public class EngineIO: Emitter
    {
        #region [ class ]
        public class Options
        {
            public bool reconnection { get; set; }
            public int reconnectionAttempts { get; set; }
            public int reconnectionDelay { get; set; }
            public int timeout { get; set; }
            public bool autoConnect { get; set; }
            public Dictionary<string, string> query { get; set; }

            public Options()
            {
                reconnection = true;
                reconnectionAttempts = int.MaxValue;
                reconnectionDelay = 1000;
                timeout = 20000;
                autoConnect = true;
                query = new Dictionary<string, string>();
            }
        }
        #endregion

        #region [ fields ]
        private IWebsocket _websocket;
        private Timer _pingTimer;
        #endregion

        #region [ properties ]   
        public string id { get { return session == null ? null : session.sid; } }
        public string url { get; private set; }
        public Options options { get; private set; }
        public EngineIOSession session { get; private set; }
        public ReadyState readyState { get { return _websocket.readyState; } }
        public bool debug 
        {
            get
            {
                return Logger.Enabled;
            }
            set
            {
                Logger.Enabled = value;
                _websocket.Logger.Enabled = value;
            }
        }
        #endregion

        #region [ constructor ]
        public EngineIO(IWebsocket websocket, string url, Options options = null)
        {            
            this.options = options == null
                ? new Options()
                : options;

            this.url = url;
            
            _pingTimer = new Timer();
            _pingTimer.Elapsed += (s, e) =>
            {
                Ping();
            };
            
            _websocket = websocket;
            _websocket.onmessage += (s, e) =>
            {
                if (e.Value.IsText)
                {
                    Receive(e.Value.Data);
                }                
            };
            _websocket.onclose += (s, e) =>
            {
                emit("close", e.Value.reason);
                _pingTimer.Stop();
            };
            _websocket.onerror += (s, e) =>
            {
                emit("error", e.Value);
            };
            if (this.options.autoConnect)
            {
                connect();
            }
        }
        #endregion

        #region [ public ]              
        public void connect()
        {
            Logger.Log("connect()");
            var uriBuilder = new UriBuilder(url);
            if (uriBuilder.Scheme != "ws" && uriBuilder.Scheme != "wss")
            {
                throw new Exception("Only socket transport is implemented");
            }
            uriBuilder.Path += "/socket.io";
            uriBuilder.Query = "EIO=2&transport=websocket" + "&" + options.query.Serialise();
            
            var connectionUrl = uriBuilder.ToString();
            _websocket.connect(connectionUrl);
        }
        public void disconnect()
        {
            Logger.Log("disconnect()");
            _websocket.close("user");
        }
        public void send(string data)
        {
            Send(new EngineIOPacket(EngineIOPacketType.message, data));
        }
        #endregion

        #region [ private ]
        private void Send(EngineIOPacket packet)
        {
            Logger.Log(string.Format("send packet type = '{0}', rawData = {1}", packet.Type, packet.Serialize()));
            _websocket.Send(packet.Serialize());
        }
        private void Receive(string input)
        {
            // [1] - Parse 
            var packets = new List<EngineIOPacket>();

            var p = (new EngineIOPacket(input));
            packets.Add(p);
            Logger.Log(string.Format("receive packet type = '{0}', rawData = {1}", p.Type, input));     

            // [2] - Execute
            packets.ToList().ForEach(packet =>
            {
                try
                {
                    switch (packet.Type)
                    {
                        case EngineIOPacketType.open:
                            emit("open", packet.Data);
                            session = packet.GetSession();
                            _pingTimer.Interval = session.pingInterval / 2.0d;
                            _pingTimer.Start();
                            break;

                        case EngineIOPacketType.close:
                            emit("close", packet.Data);
                            session = null;
                            _pingTimer.Stop();
                            break;

                        case EngineIOPacketType.message:
                            emit("message", packet.Data);
                            break;

                        case EngineIOPacketType.ping:
                        case EngineIOPacketType.pong:
                            emit(packet.Type.ToString(), packet.Data);
                            break;

                        default:
                            emit(packet.Type.ToString(), packet.Data);
                            break;
                    }
                }
                catch (Exception ex)
                {
                    emit("error", string.Format("error in executing packet {0}: {1}", packet.Serialize(), ex.Message));
                }
            });
        }
        private void Ping()
        {

            Send(new EngineIOPacket(EngineIOPacketType.ping, "probe"));
            emit("ping", "probe");

        }
        #endregion

    }
}
