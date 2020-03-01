using nex.types;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace nex.ws
{
    public class HubClient<TUser, TToken> : WSClientBase<TUser, TToken>
    {
        #region [ constants ]
        private static readonly string PUBLISH_EVENT = "__hub::publish__";
        #endregion

        #region [ fields ] 
        private RestProtocolClient<HubRequest, HubResponse> _restProtocol;
        private HubSubscriptionCollection _subscriptions = new HubSubscriptionCollection();
        #endregion

        #region [ properties ]
        public int DefaultRequestTimeout { get { return _restProtocol.DefaultRequestTimeout; } set { _restProtocol.DefaultRequestTimeout = value; } }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<HubEventMessage>> EventReceive;
        public event EventHandler<EventArgs<HubRequest>> EventSubscribed;
        public event EventHandler<EventArgs<HubSubscriptionError>> EventSubscriptionError;
        public event EventHandler<EventArgs<WSError>> EventWSError;
        public event EventHandler<EventArgs<RestProtocolResponseError<HubResponse>>> EventResponseError;
        #endregion

        #region [ constructor ]
        public HubClient(WSApiBase<TUser, TToken> api, IWSBase ws)
            : base(api, ws)
        {
            _restProtocol = new RestProtocolClient<HubRequest, HubResponse>(ws, "hub");
            _restProtocol.EventWSError += (s, e) => { if (EventWSError != null) EventWSError(this, e); };
            _restProtocol.EventResponseError += (s, e) => { if (EventResponseError != null) EventResponseError(this, e); };
        }
        #endregion        

        #region [ public ]
        public void Init()
        {
            _restProtocol.Init();
            Ws.On(PUBLISH_EVENT, data =>
            {
                var msg = data.ToObject<HubEventMessage>();
                if (EventReceive != null) EventReceive(this, new EventArgs<HubEventMessage>(msg));
            });
            Ws.EventReconnected += (s, e) =>
            {
                Api.Auth.EventAuthenticateChange += Auth_EventAuthenticateChange;                
            };
        }       
        public async Task Subscribe(string service, string eventName, object credentials = null)
        {
            if (!Ws.IsConnected) throw new Exception("ws is not connected");
            
            var subRequest = new HubRequest
            {
                service = service,
                eventName = eventName,
                credentials = credentials,
                method = "subscribe"
            };

            if (_subscriptions.Contains(subRequest))
                _subscriptions.Remove(subRequest);

            await _restProtocol.RequestAsync(subRequest);
            _subscriptions.Add(subRequest);
            if (EventSubscribed != null ) EventSubscribed(this, new EventArgs<HubRequest>(subRequest));
        }
        public async Task Unsubscribe(string service, string eventName)
        {
            if (!Ws.IsConnected) throw new Exception("ws is not connected");

            var unsubRequest = new HubRequest
            {
                service = service,
                eventName = eventName,
                method = "unsubscribe"
            };

            if (!_subscriptions.Contains(unsubRequest))
                throw new Exception("subscription not found");

            await _restProtocol.RequestAsync(unsubRequest);
            _subscriptions.Remove(unsubRequest);
            if (EventSubscribed != null) EventSubscribed(this, new EventArgs<HubRequest>(unsubRequest));
        }
        #endregion

        #region [ private ]      
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
                    if (EventSubscriptionError != null) EventSubscriptionError(this, new EventArgs<HubSubscriptionError>(new HubSubscriptionError(req, ex)));
                }
            }
        }
        private void Auth_EventAuthenticateChange(object sender, EventArgs<bool> e)
        {
            Api.Auth.EventAuthenticateChange -= Auth_EventAuthenticateChange;
            RequestExistingSubscriptions();
        }
        #endregion
    }
}
