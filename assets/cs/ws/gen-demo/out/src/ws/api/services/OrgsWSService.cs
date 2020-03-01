using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using nex.ws;

namespace template.api.wsclient
{
    public class OrgsWSService<TUser, TToken>: WSServiceBase<TUser, TToken>
    {
        #region [ implement WSServiceBase ]
        public override string Name { get { return "orgs"; } }
        #endregion

        #region [ constructor ]
        public OrgsWSService(RestClient<TUser, TToken> rest, HubClient<TUser, TToken> hub)
            :base(rest, hub)
        {
        }
        #endregion

        #region [ hub private ]
        #endregion

        #region [ hub public ]
        #endregion

        #region [ rest ]

        // isAuth: false
        public Task<OrgType> funcA(OrgType options) { return Request<OrgType>( "funcA", options, null  ); }

        // isAuth: true
        public Task<string> funcB(string name) { return Request<string>( "funcB", new { name }, null  ); }
        #endregion
    }
}
