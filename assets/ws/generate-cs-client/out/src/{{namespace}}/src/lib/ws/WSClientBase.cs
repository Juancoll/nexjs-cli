using nex.types;
using System;

namespace nex.ws
{
    public abstract class WSClientBase
    {
        #region [ private ]
        private RestClient _rest;
        private HubClient _hub;
        private IWSBase _ws;
        #endregion

        #region [ properties ]
        public RestClient Rest { get { return _rest; } }
        public HubClient Hub { get { return _hub; } }
        public IWSBase    Ws { get { return _ws; } }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<WSError>> EventWSError;
        #endregion

        #region [ constructor  ]
        public WSClientBase()
        {
            _ws = new WSBase();
            _hub = new HubClient(_ws);
            _rest = new RestClient(_ws);

            Ws.EventNewSocketInstance += (s, e) =>
            {
                Hub.Initialize();
                Rest.Initialize();
            };
            Ws.EventConnectionChange += (s, e) =>
            {
                if (e.Value)
                {
                    Hub.connect();
                }
            };

            Rest.EventWSError += (s, e) => { if (EventWSError != null) EventWSError(this, e); };
            Hub.EventWSError += (s, e) => { if (EventWSError != null) EventWSError(this, e); };
        }
        #endregion
    }
}
