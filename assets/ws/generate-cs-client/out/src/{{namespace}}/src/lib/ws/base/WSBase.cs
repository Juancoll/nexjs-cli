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
    public class WSBase : IWSBase
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
                    throw new Exception($"RequestQueue already contains event '{eventName}'");

                _requests.Add(eventName, new Request());
            }
            public bool IsDone(string eventName)
            {
                if (!_requests.ContainsKey(eventName))
                    throw new Exception($"RequestQueue not contains event '{eventName}'");

                return _requests[eventName].Done;
            }
            public void Receive(string eventName, object data ) 
            {
                if (!_requests.ContainsKey(eventName))
                    throw new Exception($"RequestQueue not contains event '{eventName}'");

                if (!(data is JToken))
                    throw new Exception($"event'{eventName}' response data is not typeof JToken");

                _requests[eventName].Done = true;
                _requests[eventName].ResponseData = data as JToken;
            }
            public JToken Dequeue(string eventName)
            {
                if (!_requests.ContainsKey(eventName))
                    throw new Exception($"RequestQueue not contains event '{eventName}'");

                var data = _requests[eventName].ResponseData;
                _requests.Remove(eventName);
                return data;
            }
            #endregion
        }
        #endregion

        #region [ fields ]
        private SocketIO _socket;
        private RequestQueue _requestQueue = new RequestQueue();
        #endregion

        #region [ properties ]
        public string Id => _socket.id;
        public int DefaultRequestTimeout { get; set; }
        public bool IsConnected { get { return _socket == null ? false : _socket.connected; } }
        public string Url { get; private set; }
        public string Nsp { get; private set; }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<EventData>> EventSend;
        public event EventHandler<EventArgs<EventData>> EventReceive;
        public event EventHandler<EventArgs<bool>> EventConnectionChange;
        public event EventHandler<EventArgs> EventNewSocketInstance;
        public event EventHandler<EventArgs<EventError>> EventSubscriptionError;
        public event EventHandler<EventArgs<NestJSWSException>> EventNestJSException;
        #endregion

        #region [ constructor ]
        public WSBase()
        {
            DefaultRequestTimeout = 3000;
        }
        #endregion

        #region [ IWSBase ]
        public void Connect(string url, string nsp = "/", string authToken = null)
        {
            if (_socket != null)
                _socket.disconnect();

            Url = url;
            Nsp = nsp;

            var options = new EngineIO.Options();
            if (authToken != null)
            {
                options.query.Add("auth_token", authToken);
            }
            _socket = new SocketIO(new WebSocketSharpImpl(), url, nsp, options);

            _socket
                .on("connect", data =>
                {
                    EventConnectionChange?.Invoke(this, new EventArgs<bool>(true));
                })
                .on("disconnect", data =>
                {
                    EventConnectionChange?.Invoke(this, new EventArgs<bool>(false));
                })
                .on("exception", data =>
                {
                    var error = (data as JToken).ToObject<NestJSWSException>();
                    EventNestJSException?.Invoke(this, new EventArgs<NestJSWSException>(error));
                });

            _socket.EventReceive += (s, e) =>
            {
                EventReceive?.Invoke(this, new EventArgs<EventData>(new EventData(e.Value.Name, e.Value.Data)));

                if (_requestQueue.Contains(e.Value.Name))
                {
                    _requestQueue.Receive(e.Value.Name, e.Value.Data);
                }
            };
            EventNewSocketInstance?.Invoke(this, new EventArgs());
        }
        public void Disconnect()
        {
            _socket.disconnect();
        }

        public async Task<T> RequestAsync<T>(string eventName, object data, int timeout)
        {
            if (_socket == null || _socket.disconnected)
                throw new Exception("websocket not connected");

            if (_requestQueue.Contains(eventName))
                throw new Exception($"RequestQueue already contains request {eventName}");

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
                throw new TimeoutException($"elapsed time = {timer.Elapsed.TotalMilliseconds} millis");
           
            return responseData.ToObject<T>();
        }
        public async Task RequestAsync(string eventName, object data, int timeout = 0)
        {
            if (_socket == null || _socket.disconnected)
                throw new Exception("websocket not connected");

            if (_requestQueue.Contains(eventName))
                throw new Exception($"RequestQueue already contains request {eventName}");

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
                throw new TimeoutException($"elapsed time = {timer.Elapsed.TotalMilliseconds} millis");
        }
        
        public IWSBase Subscribe(string eventName, Action<JToken> action)
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
                    EventSubscriptionError?
                        .Invoke(this, new EventArgs<EventError>(new EventError(eventName, ex)));
                }
            });
            return this;
        }
        public void Publish(string eventName, object data = null)
        {
            _socket.send(eventName, data);

            JToken jtoken = data == null
                ? null
                : JToken.FromObject(data);

            EventSend?.Invoke(this, new EventArgs<EventData>(new EventData(eventName, jtoken)));
        }
        #endregion
    }
}
