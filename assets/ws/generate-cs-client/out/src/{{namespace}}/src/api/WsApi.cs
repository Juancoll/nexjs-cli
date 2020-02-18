using nex.ws;

namespace {{namespace}}
{
    public class WSApi : WSClientBase
    {
        #region [ services ]
        {{#services}}
        public {{serviceUpperName}}WSService {{serviceName}} { get; }
        {{/services}}
        #endregion

        #region [ constructor ]
        public WSApi()
        {
            {{#services}}
            {{serviceName}} = new {{serviceUpperName}}WSService(Rest, Hub);
            {{/services}}
        }
        #endregion
    }
}
