using nex.ws;

namespace {{namespace}}
{
    public class WSApi : WSClientBase
    {
        #region [ private ]
        {{#services}}
        private {{serviceUpperName}}WSService _{{serviceName}};
        {{/services}}
        #endregion

        #region [ services ]
        {{#services}}
        public {{serviceUpperName}}WSService {{serviceName}} { get; }
        {{/services}}
        #endregion

        #region [ constructor ]
        public WSApi()
        {
            {{#services}}
            _{{serviceName}} = new {{serviceUpperName}}WSService(Rest, Hub);
            {{/services}}
        }
        #endregion
    }
}
