using nex.types;
using System;

namespace nex.ws
{
    public abstract class WSClientBase
    {
        #region [ properties ]
        public RestClient Rest { get; }
        public HubClient Hub { get; }
        public IWSBase    Ws { get; }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<WSError>> EventWSError;
        #endregion

        #region [ constructor  ]
        public WSClientBase()
        {
            Ws = new WSBase();
            Hub = new HubClient(Ws);
            Rest = new RestClient(Ws);

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

            Rest.EventWSError += (s, e) => EventWSError?.Invoke(this, e);
            Hub.EventWSError += (s, e) => EventWSError?.Invoke(this, e);
        }
        #endregion
    }
}
