using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using nex.ws;

namespace {{namespace}}
{
    public class {{serviceUpperName}}WSService: WSServiceBase 
    {
        #region [ implement WSServiceBase ]
        public override string Name => "{{serviceName}}";
        #endregion

        #region [ constructor ]
        public {{serviceUpperName}}WSService(RestClient rest, HubClient hub)
            :base(rest, hub)
        {
            {{#hubEvents}}
            {{name}} = new {{notification}}{{&arguments}}(hub, Name, "{{name}}");
            {{/hubEvents}}
        }
        #endregion

        #region [ hub ]
        {{#hubEvents}}

        // isAuth: {{isAuth}}
        public {{notification}}{{&arguments}} {{name}} { get; }
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
