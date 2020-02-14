using nex.types;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace nex.ws
{
    public class HubClient
    {
        #region [ constants ]
        private static readonly string REQUEST_EVENT = "__hub::request__";
        private static readonly string RESPONSE_EVENT = "__hub::response__";
        private static readonly string PUBLISH_EVENT = "__hub::publish__";
        #endregion

        #region [ fields ] 
        private IWSBase _ws;
        private HubRequestQueue _requestQueue = new HubRequestQueue();
        private HubSubscriptionCollection _subscriptions = new HubSubscriptionCollection();
        #endregion

        #region [ properties ]
        public int DefaultRequestTimeout { get; set; }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<HubMessage>> EventReceive;
        public event EventHandler<EventArgs<HubRequest>> EventSubscribed;
        public event EventHandler<EventArgs<HubSubscriptionError>> EventSubscriptionError;
        public event EventHandler<EventArgs<HubResponseError>> EventResponseError;
        public event EventHandler<EventArgs<WSError>> EventWSError;
        #endregion

        #region [ constructor ]
        public HubClient(IWSBase ws)
        {
            _ws = ws;
            DefaultRequestTimeout = 30000;
        }
        #endregion        

        #region [ methods ]
        public void Initialize()
        {
            _ws
                .Subscribe(RESPONSE_EVENT, data =>
                {
                    var res = data.ToObject<HubResponse>();
                    if (!_requestQueue.Contains(res) || _requestQueue.IsDone(res))
                    {
                        var error = $"RequestQueue error with id = {_requestQueue.GetId(res)}";
                        EventResponseError?.Invoke(this, new EventArgs<HubResponseError>(new HubResponseError(res, error)));
                    }
                    else
                    {
                        _requestQueue.Receive(res);
                    }
                })
                .Subscribe(PUBLISH_EVENT, data =>
                {
                    var msg = data.ToObject<HubMessage>();
                    EventReceive?.Invoke(this, new EventArgs<HubMessage>(msg));
                });
        }
        public void connect()
        {
            RequestExistingSubscriptions();
        }

        public async Task Subscribe(string service, string eventName, object credentials = null)
        {
            var subRequest = new HubRequest
            {
                service = service,
                eventName = eventName,
                credentials = credentials,
                method = "subscribe"
            };

            if (!_ws.IsConnected)
            {
                if (_subscriptions.Contains(subRequest))
                    _subscriptions.Update(subRequest);
                else
                    _subscriptions.Add(subRequest);
                return;
            }

            if (_subscriptions.Contains(subRequest))
                _subscriptions.Remove(subRequest);

            await RequestAsync(subRequest);
            _subscriptions.Add(subRequest);
            EventSubscribed?.Invoke(this, new EventArgs<HubRequest>(subRequest));
        }
        public async Task Unsubscribe(string service, string eventName)
        {
            var unsubRequest = new HubRequest
            {
                service = service,
                eventName = eventName,
                method = "unsubscribe"
            };

            if (!_subscriptions.Contains(unsubRequest))
                throw new Exception("subscription not found");

            if (!_ws.IsConnected)
            {
                _subscriptions.Remove(unsubRequest);
                return;
            }

            await RequestAsync(unsubRequest);
            _subscriptions.Remove(unsubRequest);
        }
        #endregion

        #region [ private ]
        private async Task RequestAsync(HubRequest req, int timeout = 0)
        {
            if (!_ws.IsConnected)
                throw new Exception("ws is not connected");

            if (_requestQueue.Contains(req))
                throw new Exception($"RequestQueue already contains request id {_requestQueue.GetId(req)}");

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
                throw new TimeoutException($"elapsed time = {timer.Elapsed.TotalMilliseconds} millis");


            if (!response.isSuccess)
            {
                if (response.error != null)
                {
                    EventWSError?.Invoke(this, new EventArgs<WSError>(response.error));
                    throw new Exception(response.error.Message);
                }
                else
                {
                    throw new Exception("undefined error");
                }
            }
        }
        private async void RequestExistingSubscriptions()
        {
            foreach (var req in new List<HubRequest>(_subscriptions.List()))
            {
                try
                {
                    await Subscribe(req.service, req.eventName, req.credentials);
                }
                catch (Exception ex)
                {
                    _subscriptions.Remove(req);
                    EventSubscriptionError?.Invoke(this, new EventArgs<HubSubscriptionError>(new HubSubscriptionError(req, ex)));
                }
            }
        }
        #endregion
    }
}
