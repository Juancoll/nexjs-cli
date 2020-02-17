using nex.ws;

namespace {{namespace}}
{
    public class WSApi : WSClientBase
    {
        #region [ services ]
        {{#services}}
        public {{service.upper}}WSService {{service.name}} { get; }
        {{/services}}
        #endregion

        #region [ constructor ]
        public WSApi()
        {
            {{#services}}
            {{service.name}} = new {{service.upper}}WSService(Rest, Hub);
            {{/services}}
        }
        #endregion
    }
}
