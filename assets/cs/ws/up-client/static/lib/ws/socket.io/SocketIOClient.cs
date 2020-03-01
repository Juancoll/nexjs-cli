using Newtonsoft.Json.Linq;
using nex.engineio;
using nex.socketio;
using nex.types;
using nex.WebSocketSharp;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace nex.ws
{   
    public class SocketIOClient : IWSBase
    {
        #region [ class ]
        class RequestQueue
        {
            #region [ class ]
            class Request
            {                
                public bool Done { get; set; }
                public JToken ResponseData { get; set; }

                public Request()
                {                    
                    Done = false;
                    ResponseData = null;
                }
            }
            #endregion

            #region [ fields ]
            private Dictionary<string, Request> _requests = new Dictionary<string, Request>();
            #endregion          

            #region [ public ]
            public bool Contains(string eventName)
            {
                return _requests.ContainsKey(eventName);
            }
            public void Add(string eventName)
            {
                if (_requests.ContainsKey(eventName))
                    throw new Exception(String.Format("RequestQueue already contains event '{0}'", eventName));

                _requests.Add(eventName, new Request());
            }
            public bool IsDone(string eventName)
            {
                if (!_requests.ContainsKey(eventName))
                    throw new Exception(string.Format("RequestQueue not contains event '{0}'", eventName));

                return _requests[eventName].Done;
            }
            public void Receive(string eventName, object data ) 
            {
                if (!_requests.ContainsKey(eventName))
                    throw new Exception(string.Format("RequestQueue not contains event '{0}'", eventName));

                if (!(data is JToken))
                    throw new Exception(string.Format("event'{0}' response data is not typeof JToken", eventName));

                _requests[eventName].Done = true;
                _requests[eventName].ResponseData = data as JToken;
            }
            public JToken Dequeue(string eventName)
            {
                if (!_requests.ContainsKey(eventName))
                    throw new Exception(string.Format("RequestQueue not contains event '{0}'", eventName));

                var data = _requests[eventName].ResponseData;
                _requests.Remove(eventName);
                return data;
            }
            #endregion
        }
        #endregion

        #region [ fields ]
        private bool _requestDisconnect;
        private SocketIO _socket;
        private RequestQueue _requestQueue = new RequestQueue();
        private bool _isConnected;
        #endregion

        #region [ properties ]
        public string Id { get { return _socket.id; } }
        public int DefaultRequestTimeout { get; set; }
        public bool IsConnected { get { return _isConnected; } }
        public string Url { get; private set; }
        public string Nsp { get; private set; }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<EventData>> EventSend;
        public event EventHandler<EventArgs<EventData>> EventReceive;
        public event EventHandler<EventArgs<bool>> EventConnectionChange;
        public event EventHandler<EventArgs<int>> EventReconnecting;
        public event EventHandler<EventArgs<int>> EventReconnected;
        public event EventHandler<EventArgs> EventDisconnect;
        public event EventHandler<EventArgs> EventNewSocketInstance;
        public event EventHandler<EventArgs<EventError>> EventSubscriptionError;
        public event EventHandler<EventArgs<NestJSWSException>> EventNestJSException;
        #endregion

        #region [ constructor ]
        public SocketIOClient()
        {
            DefaultRequestTimeout = 3000;
        }
        #endregion

        #region [ IWSBase ]
        public void Connect(string url, string nsp = "/")
        {
            if (_socket != null)
                _socket.disconnect();

            Url = url;
            Nsp = nsp;

            var options = new EngineIO.Options();
            _socket = new SocketIO(new WebSocketSharpImpl(), url, nsp, options);

            _socket
                .on("connect", data =>
                {
                    _isConnected = true;
                    if (EventConnectionChange != null) EventConnectionChange(this, new EventArgs<bool>(true));
                })
                .on("disconnect", data =>
                {
                    this._isConnected = false;
                    if (EventConnectionChange != null) EventConnectionChange(this, new EventArgs<bool>(false));
                    if (_requestDisconnect)
                    {
                        _requestDisconnect = false;
                        if (EventDisconnect != null) EventDisconnect(this, new EventArgs());
                        
                    }
                })
                .on("reconnecting", data =>
                {
                    if (EventReconnecting != null) EventReconnecting(this, new EventArgs<int>((int)data));
                })
                .on("reconnect", data =>
                {
                    this._isConnected = false;
                    if (EventReconnected != null) EventReconnected(this, new EventArgs<int>((int)data));
                })
                .on("exception", data =>
                {
                    var error = (data as JToken).ToObject<NestJSWSException>();
                    if (EventNestJSException != null) EventNestJSException(this, new EventArgs<NestJSWSException>(error));
                });

            _socket.EventReceive += (s, e) =>
            {
                if (EventReceive != null ) EventReceive(this, new EventArgs<EventData>(new EventData(e.Value.Name, e.Value.Data)));

                if (_requestQueue.Contains(e.Value.Name))
                {
                    _requestQueue.Receive(e.Value.Name, e.Value.Data);
                }
            };
            if (EventNewSocketInstance != null ) EventNewSocketInstance(this, new EventArgs());
        }
        public async Task ConnectAsync(string url, string nsp = "/")
        {
            Connect(url, nsp);
            var timeout = TimeSpan.FromMilliseconds(5000);
            var timer = new Stopwatch();
            timer.Start();
            while(!IsConnected && timer.Elapsed < timeout)
            {
                await Task.Delay(100);
            }
            timer.Stop();
            if (timer.Elapsed >= timeout)
                throw new TimeoutException(string.Format("elapsed time = {0} millis", timer.Elapsed.TotalMilliseconds));
        }
        public void Disconnect()
        {
            _requestDisconnect = true;
            _socket.disconnect();
        }

        public async Task<T> RequestAsync<T>(string eventName, object data, int timeout)
        {
            if (_socket == null || _socket.disconnected)
                throw new Exception("websocket not connected");

            if (_requestQueue.Contains(eventName))
                throw new Exception(string.Format("RequestQueue already contains request {0}", eventName));

            _requestQueue.Add(eventName);
            _socket.emit(eventName, data);

            var timeoutSpan = timeout == 0
                ? TimeSpan.FromMilliseconds(DefaultRequestTimeout)
                : TimeSpan.FromMilliseconds(timeout);
            var timer = new Stopwatch();
            timer.Start();

            while (!_requestQueue.IsDone(eventName) && timer.Elapsed < timeoutSpan)
            {
                await Task.Delay(100);
            }
            
            var responseData = _requestQueue.Dequeue(eventName);

            timer.Stop();
            if (timer.Elapsed >= timeoutSpan)
                throw new TimeoutException(string.Format("elapsed time = {0} millis", timer.Elapsed.TotalMilliseconds));
           
            return responseData.ToObject<T>();
        }
        public async Task RequestAsync(string eventName, object data, int timeout = 0)
        {
            if (_socket == null || _socket.disconnected)
                throw new Exception("websocket not connected");

            if (_requestQueue.Contains(eventName))
                throw new Exception(string.Format("RequestQueue already contains request {0}", eventName));

            _requestQueue.Add(eventName);
            _socket.emit(eventName, data);

            var timeoutSpan = timeout == 0
                ? TimeSpan.FromMilliseconds(DefaultRequestTimeout)
                : TimeSpan.FromMilliseconds(timeout);
            var timer = new Stopwatch();
            timer.Start();

            while (!_requestQueue.IsDone(eventName) && timer.Elapsed < timeoutSpan)
            {
                await Task.Delay(100);
            }

            _requestQueue.Dequeue(eventName);

            timer.Stop();
            if (timer.Elapsed >= timeoutSpan)
                throw new TimeoutException(string.Format("elapsed time = {0} millis", timer.Elapsed.TotalMilliseconds));
        }
        
        public IWSBase On(string eventName, Action<JToken> action)
        {
            _socket.on(eventName, (data) => 
            {
            if (!(data is JToken))
                throw new Exception("Invalid data type");

                try
                {
                    action(data as JToken);
                }
                catch (Exception ex)
                {
                    if (EventSubscriptionError != null) EventSubscriptionError(this, new EventArgs<EventError>(new EventError(eventName, ex)));
                }
            });
            return this;
        }
        public void Emit(string eventName, object data = null)
        {
            _socket.send(eventName, data);

            JToken jtoken = data == null
                ? null
                : JToken.FromObject(data);

            if (EventSend != null) EventSend(this, new EventArgs<EventData>(new EventData(eventName, jtoken)));
        }
        #endregion
    }
}
