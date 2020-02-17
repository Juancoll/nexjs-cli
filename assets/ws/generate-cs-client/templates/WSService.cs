using nex.ws;
using System.Threading.Tasks;

namespace {{namespace}}
{
    public class {{service.upper}}WSService: WSServiceBase 
    {
        #region [ implement WSServiceBase ]
        public override string Name => "{{service.name}}";
        #endregion

        #region [ constructor ]
        public {{service.upper}}WSService(RestClient rest, HubClient hub)
            :base(rest, hub)
        {
            {{#hub}}
            {{event}} = new HubNotification<{{credentials}}, {{data}}>(hub, Name, "{{event}}");
            {{/hub}}
        }
        #endregion

        #region [ hub ]
        {{#hub}}
        public HubNotification<{{credentials}}, {{data}}> {{event}} { get; }
        {{/hub}}
        #endregion

        #region [ rest ]
        {{#rest}}
        public Task<{{&returnType}}> {{method}}({{&methodParams}}) { return Request<{{returnType}}>( "{{method}}", {{&requestParams}} ); }
        {{/rest}}
        #endregion
    }
}
