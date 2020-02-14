using System.Threading.Tasks;

namespace nex.ws
{
    public abstract class WSServiceBase
    {
        #region [ abstract ]
        public abstract string Name { get; }
        #endregion

        #region [ private ]
        private RestClient _rest { get; }
        private HubClient _hub { get; }
        #endregion

        #region [ constructor ]
        public WSServiceBase(RestClient rest, HubClient hub)
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

        protected HubNotification<TCredentials, TData> NewEvent<TCredentials, TData>(string eventName){
            return new HubNotification<TCredentials, TData>(_hub, Name, eventName);
        }
        #endregion
    }
}
