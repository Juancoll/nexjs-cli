using nex.types;
using nex.websocket;
using System;
using System.Threading.Tasks;
using WebSocketSharp;

namespace nex.WebSocketSharp
{
    public class WebSocketSharpImpl : IWebsocket
    {
        #region [ fields ]
        WebSocket _ws;
        #endregion

        #region [ properties ]
        public types.Logger Logger { get; set; }
        #endregion

        #region [ constructor ]
        public WebSocketSharpImpl()
        {
            Logger = new types.Logger(GetType().Name);
        }
        #endregion

        #region [ IWebsocket implementation ]
        public string url => _ws == null ? null : _ws.Url.AbsoluteUri;
        public ReadyState readyState => _ws == null ? ReadyState.CLOSED : (ReadyState)((int)_ws.ReadyState);

        public event EventHandler onopen;
        public event EventHandler<EventArgs<string>> onerror;
        public event EventHandler<EventArgs<CloseState>> onclose;
        public event EventHandler<EventArgs<Message>> onmessage;

        public void close(string reason)
        {
            Logger.Log($"close( {reason} )");
            _ws.Close();            
        }

        public void connect(string url)
        {
            if (_ws != null)
            {
                switch (readyState)
                { 
                    case ReadyState.CONNECTING: return;
                    case ReadyState.OPEN: 
                        close("reconnection request");
                        break;
                    case ReadyState.CLOSED:                     
                    case ReadyState.CLOSING: 
                        break;
                }
            }

            _ws = new WebSocket(url);
            _ws.OnOpen += (s, e) =>
            {
                Logger.Log("OnOpen");
                onopen?.Invoke(this, new EventArgs());
            };
            _ws.OnClose += (s, e) =>
            {
                Logger.Log("OnClose");
                onclose?.Invoke(this, new EventArgs<CloseState>(new CloseState
                {
                    code = e.Code,
                    wasClean = e.WasClean,
                    reason = e.Reason
                }));
            };

            _ws.OnError += (s, e) =>
            {
                Logger.Log("OnError");
                onerror?.Invoke(this, new EventArgs<string>(e.Message));
            };
            _ws.OnMessage += (s, e) =>
            {
                if (e.IsText)Logger.Log("OnMessage " + e.Data);
                if (e.IsBinary) Logger.Log("OnMessage binary data");
                if (e.IsPing) Logger.Log("OnMessage ping");

                onmessage?.Invoke(this, new EventArgs<Message>(new Message
                {
                    Data = e.Data,
                    IsBInary = e.IsBinary,
                    IsPing = e.IsPing,
                    IsText = e.IsText,
                    RawData = e.RawData
                }));
            };
            _ws.ConnectAsync();
        }

        public void Send(string data)
        {
            Logger.Log("Send " + data);
            if (_ws.ReadyState != WebSocketState.Open)
            {
                Logger.Log("Send " + data + ", error: Socket not opened");
                return;
            }
            _ws.Send(data);
        }

        public void Send(byte[] data)
        {
            _ws.Send(data);
        }
        #endregion
    }
}
