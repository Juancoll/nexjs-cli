using nex.types;
using System;

namespace nex.ws
{
    public abstract class WSApiBase<TUser, TToken>
    {
        #region [ private ]
        private AuthClient<TUser, TToken> _auth;
        private RestClient<TUser, TToken> _rest;
        private HubClient<TUser, TToken> _hub;
        private IWSBase _ws;
        #endregion

        #region [ properties ]
        public AuthClient<TUser, TToken> Auth { get { return _auth; } }
        public RestClient<TUser, TToken> Rest { get { return _rest; } }
        public HubClient<TUser, TToken> Hub { get { return _hub; } }
        public IWSBase    Ws { get { return _ws; } }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<WSError>> EventWSError;
        #endregion

        #region [ constructor  ]
        public WSApiBase()
        {
            _ws = new SocketIOClient();
            _auth = new AuthClient<TUser, TToken>(this, _ws);
            _hub = new HubClient<TUser, TToken>(this, _ws);
            _rest = new RestClient<TUser, TToken>(this, _ws);

            Ws.EventNewSocketInstance += (s, e) =>
            {
                Auth.Init();
                Hub.Init();
                Rest.Init();
            };
            Auth.EventWSError += (s, e) => { if (EventWSError != null) EventWSError(this, e); };
            Rest.EventWSError += (s, e) => { if (EventWSError != null) EventWSError(this, e); };
            Hub.EventWSError += (s, e) => { if (EventWSError != null) EventWSError(this, e); };
        }
        #endregion
    }
}
