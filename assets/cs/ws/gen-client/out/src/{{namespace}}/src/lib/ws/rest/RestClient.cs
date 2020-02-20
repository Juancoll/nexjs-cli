using Newtonsoft.Json.Linq;
using nex.types;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace nex.ws
{
    public class RestClient
    {
        #region [ constants ]
        private static readonly string REQUEST_EVENT = "__rest::request__";
        private static readonly string RESPONSE_EVENT = "__rest::response__";
        #endregion

        #region [ fields ]        
        private IWSBase _ws;
        private RestRequestQueue _requestQueue = new RestRequestQueue();
        #endregion

        #region [ properties ]
        public int DefaultRequestTimeout { get; set; }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<RestResponseError>> EventResponseError;
        public event EventHandler<EventArgs<WSError>> EventWSError;
        #endregion

        #region [ constructor ]
        public RestClient(IWSBase ws)
        {
            DefaultRequestTimeout = 33000;
            _ws = ws;
        }
        #endregion

        #region [ methods ]
        public void Initialize()
        {
            _ws.Subscribe(RESPONSE_EVENT, data =>
            {
                var res = data.ToObject<RestResponse>();
                if (!_requestQueue.Contains(res) || _requestQueue.IsDone(res))
                {
                    var error = string.Format("error with id = {0}. not exists or is done", _requestQueue.GetId(res));
                    if (EventResponseError != null) EventResponseError(this, new EventArgs<RestResponseError>(new RestResponseError(res, error)));
                }
                else
                {
                    _requestQueue.Receive(res);
                }
            });
        }

        public async Task RequestAsync(RestRequest req, int timeout = 0)
        {
            if (!_ws.IsConnected)
                throw new Exception("ws is not connected");

            if (_requestQueue.Contains(req))
                throw new Exception(string.Format("RequestQueue already contains request id {0}", _requestQueue.GetId(req)));

            _requestQueue.Add(req);
            _ws.Publish(REQUEST_EVENT, req);

            var timeoutSpan = timeout == 0
              ? TimeSpan.FromMilliseconds(DefaultRequestTimeout)
              : TimeSpan.FromMilliseconds(timeout);
            var timer = new Stopwatch();
            timer.Start();

            while (!_requestQueue.IsDone(req) && timer.Elapsed < timeoutSpan)
            {
                await Task.Delay(100);
            }
            
            var response = _requestQueue.Dequeue(req);

            timer.Stop();
            if (timer.Elapsed >= timeoutSpan)
                throw new TimeoutException(string.Format("elapsed time = {0} millis", timer.Elapsed.TotalMilliseconds));

            if (!response.isSuccess)
            {
                if (response.error != null)
                {
                    if (EventWSError != null) EventWSError(this, new EventArgs<WSError>(response.error));
                    throw new Exception(response.error.Message);
                }
                else
                {
                    throw new Exception("undefined error");
                }
            }
        }

        public async Task<T> RequestAsync<T>(RestRequest req, int timeout = 0)
        {
            if (!_ws.IsConnected)
                throw new Exception("ws is not connected");

            if (_requestQueue.Contains(req))
                throw new Exception(string.Format("RequestQueue already contains request id {0}", _requestQueue.GetId(req)));

            _requestQueue.Add(req);
            _ws.Publish(REQUEST_EVENT, req);

            var timeoutSpan = timeout == 0
              ? TimeSpan.FromMilliseconds(DefaultRequestTimeout)
              : TimeSpan.FromMilliseconds(timeout);
            var timer = new Stopwatch();
            timer.Start();

            while (!_requestQueue.IsDone(req) && timer.Elapsed < timeoutSpan)
            {
                await Task.Delay(20);
            }

            var response = _requestQueue.Dequeue(req);

            timer.Stop();
            if (timer.Elapsed >= timeoutSpan)
                throw new TimeoutException(string.Format("elapsed time = {0} millis", timer.Elapsed.TotalMilliseconds));

            if (!response.isSuccess)
            {
                if (response.error != null)
                {
                    if (EventWSError != null) EventWSError(this, new EventArgs<WSError>(response.error));
                    throw new Exception(response.error.Message);
                }
                else
                {
                    throw new Exception("undefined error");
                }
            }

            return response.data is JToken
                ? (response.data as JToken).ToObject<T>()
                : Cast<T>(response.data);
        }
        #endregion

        #region [ private ]
        private TOutput Cast<TOutput>(object value)
        {
            return (TOutput)Convert.ChangeType(value, typeof(TOutput));
        }
        #endregion
    }
}
