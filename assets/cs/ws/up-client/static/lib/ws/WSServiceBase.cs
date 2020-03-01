using System.Threading.Tasks;

namespace nex.ws
{
    public abstract class WSServiceBase<TUser, TToken>
    {
        #region [ abstract ]
        public abstract string Name { get; }
        #endregion

        #region [ private ]
        private RestClient<TUser, TToken> _rest;
        private HubClient<TUser, TToken> _hub;
        #endregion

        #region [ constructor ]
        public WSServiceBase(RestClient<TUser, TToken> rest, HubClient<TUser, TToken> hub)
        {
            _rest = rest;
            _hub = hub;
        }
        #endregion

        #region [ protected ]
        protected Task<T> Request<T>(string method, object data, object credentials, int timeout = 0)
        {
            return _rest.RequestAsync<T>(new RestRequest
            {
                service = Name,
                method = method,
                data = data,
                credentials = credentials
            }, timeout);
        }
        protected Task Request(string method, object data, object credentials, int timeout = 0)
        {
            return _rest.RequestAsync(new RestRequest
            {
                service = Name,
                method = method,
                data = data,
                credentials = credentials
            }, timeout);
        }
        #endregion
    }
}
