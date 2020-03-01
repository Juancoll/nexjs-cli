using Newtonsoft.Json.Linq;
using nex.types;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nex.ws
{
    public class RestProtocolClient<TRequest, TResponse>
    {
        #region  [ constants ]
        private string REQUEST_EVENT { get { return string.Format("__{0}::restprotocol::request__", _name); } }
        private string RESPONSE_EVENT { get { return string.Format("__{0}::restprotocol::response__", _name); } }
        #endregion

        #region [ fields ]
        private IWSBase _ws;
        private string _name;
        private RestProtocolRequestQueue<TResponse> _requestQueue = new RestProtocolRequestQueue<TResponse>();
        #endregion

        #region [ properties ]
        public string Name { get { return _name; } }
        public int DefaultRequestTimeout = 3000;
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<RestProtocolResponseError<TResponse>>> EventResponseError;
        public event EventHandler<EventArgs<WSError>> EventWSError;
        #endregion

        #region [ constructor ]
        public RestProtocolClient(IWSBase ws, string name)
        {
            _ws = ws;
            _name = name;
        }
        #endregion

        #region [ public ]
        public void Init()
        {
            _ws.On(RESPONSE_EVENT, data =>
            {
                var res = data.ToObject<RestProtocolResponse<TResponse>>();
                if (!_requestQueue.Contains(res) || _requestQueue.IsDone(res))
                {
                    var error = string.Format("error with id = {0}. not exists or is done", res.id);
                    if (EventResponseError != null)
                        EventResponseError(this, new EventArgs<RestProtocolResponseError<TResponse>>(new RestProtocolResponseError<TResponse>(res, error)));
                }
                else
                {
                    _requestQueue.Receive(res);
                }
            });
        }
        public async Task RequestAsync(TRequest req, int timeout = 0)
        {
            if (!_ws.IsConnected)
                throw new Exception("ws is not connected");

            var restReq = new RestProtocolRequest<TRequest>
            {
                id = Guid.NewGuid().ToString(),
                module = _name,
                data = req,
            };

            if (_requestQueue.Contains(restReq))
                throw new Exception(string.Format("RequestQueue already contains request id {0}", restReq.id));

            _requestQueue.Add(restReq);
            _ws.Emit(REQUEST_EVENT, restReq);

            var timeoutSpan = timeout == 0
              ? TimeSpan.FromMilliseconds(DefaultRequestTimeout)
              : TimeSpan.FromMilliseconds(timeout);
            var timer = new Stopwatch();
            timer.Start();

            while (!_requestQueue.IsDone(restReq) && timer.Elapsed < timeoutSpan)
            {
                await Task.Delay(100);
            }

            var response = _requestQueue.Dequeue(restReq);

            timer.Stop();
            if (timer.Elapsed >= timeoutSpan)
                throw new TimeoutException(string.Format("elapsed time = {0} millis", timer.Elapsed.TotalMilliseconds));

            if (response == null)
            {
                throw new Exception(string.Format("dequeue a not done request"));
            }

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

        public async Task<TResponse> RequestDataAsync(TRequest req, int timeout = 0)
        {
            if (!_ws.IsConnected)
                throw new Exception("ws is not connected");

            var restReq = new RestProtocolRequest<TRequest>
            {
                id = Guid.NewGuid().ToString(),
                module = _name,
                data = req,
            };

            if (_requestQueue.Contains(restReq))
                throw new Exception(string.Format("RequestQueue already contains request id {0}", restReq.id));

            _requestQueue.Add(restReq);
            _ws.Emit(REQUEST_EVENT, restReq);

            var timeoutSpan = timeout == 0
              ? TimeSpan.FromMilliseconds(DefaultRequestTimeout)
              : TimeSpan.FromMilliseconds(timeout);
            var timer = new Stopwatch();
            timer.Start();

            while (!_requestQueue.IsDone(restReq) && timer.Elapsed < timeoutSpan)
            {
                await Task.Delay(100);
            }

            var response = _requestQueue.Dequeue(restReq);

            timer.Stop();
            if (timer.Elapsed >= timeoutSpan)
                throw new TimeoutException(string.Format("elapsed time = {0} millis", timer.Elapsed.TotalMilliseconds));

            if (response == null)
            {
                throw new Exception(string.Format("dequeue a not done request"));
            }

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

            return response.data ;
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
