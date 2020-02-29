using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using nex.ws;

namespace {{namespace}}
{
    public class {{serviceUpperName}}WSService<TUser, TToken>: WSServiceBase<TUser, TToken>
    {
        #region [ implement WSServiceBase ]
        public override string Name { get { return "{{serviceName}}"; } }
        #endregion

        #region [ constructor ]
        public {{serviceUpperName}}WSService(RestClient<TUser, TToken> rest, HubClient<TUser, TToken> hub)
            :base(rest, hub)
        {
            {{#hubEvents}}
            _{{name}} = new {{notification}}{{&arguments}}(hub, Name, "{{name}}");
            {{/hubEvents}}
        }
        #endregion

        #region [ hub private ]
        {{#hubEvents}}
        private {{notification}}{{&arguments}} _{{name}} { get; }
        {{/hubEvents}}
        #endregion

        #region [ hub public ]
        {{#hubEvents}}

        // isAuth: {{isAuth}}
        public {{notification}}{{&arguments}} {{name}} { get { return _{{name}}; } }
        {{/hubEvents}}
        #endregion

        #region [ rest ]
        {{#restMethods}}

        // isAuth: {{isAuth}}
        public Task{{&returnType}} {{name}}({{&methodParams}}) { return Request{{&returnType}}( "{{name}}", {{&requestParams}} ); }
        {{/restMethods}}
        #endregion
    }
}
