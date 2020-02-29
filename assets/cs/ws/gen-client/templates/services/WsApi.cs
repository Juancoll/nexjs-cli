using nex.ws;

namespace {{namespace}}
{
    public class WSApi<TUser, TToken> : WSApiBase<TUser, TToken>
    {
        #region [ private ]
        {{#services}}
        private {{serviceUpperName}}WSService<TUser, TToken> _{{serviceName}};
        {{/services}}
        #endregion

        #region [ services ]
        {{#services}}
        public {{serviceUpperName}}WSService<TUser, TToken> {{serviceName}} { get { return _{{serviceName}}; } }
        {{/services}}
        #endregion

        #region [ constructor ]
        public WSApi()
        {
            {{#services}}
            _{{serviceName}} = new {{serviceUpperName}}WSService<TUser, TToken>(Rest, Hub);
            {{/services}}
        }
        #endregion
    }
}