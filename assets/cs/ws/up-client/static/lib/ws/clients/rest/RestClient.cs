using Newtonsoft.Json.Linq;
using nex.types;
using System;
using System.Threading.Tasks;

namespace nex.ws
{
    public class RestClient<TUser, TToken> : WSClientBase<TUser, TToken>
    {
        #region [ fields ]        
        private RestProtocolClient<RestRequest, object> _restProtocol;
        #endregion

        #region [ properties ]
        public int DefaultRequestTimeout { get { return _restProtocol.DefaultRequestTimeout; } set { _restProtocol.DefaultRequestTimeout = value; } }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<RestProtocolResponseError<object>>> EventResponseError;
        public event EventHandler<EventArgs<WSError>> EventWSError;
        #endregion

        #region [ constructor ]
        public RestClient(WSApiBase<TUser, TToken> api, IWSBase ws)
            : base(api, ws)
        {
            _restProtocol = new RestProtocolClient<RestRequest, object>(ws, "rest");
            _restProtocol.EventWSError += (s, e) => { if (EventWSError != null) EventWSError(this, e); };
            _restProtocol.EventResponseError += (s, e) => { if (EventResponseError != null) EventResponseError(this, e); };
        }
        #endregion

        #region [ methods ]
        public void Init()
        {
            _restProtocol.Init();
        }

        public Task RequestAsync(RestRequest req, int timeout = 0)
        {
            return _restProtocol.RequestAsync(req, timeout);
        }

        public async Task<T> RequestAsync<T>(RestRequest req, int timeout = 0)
        {
            var res = await _restProtocol.RequestDataAsync(req, timeout);
            return res is JToken 
                ? (res as JToken).ToObject<T>()
                : Cast<T>(res);
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
