using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using nex.ws;

namespace template.api.wsclient
{
    public class CustomWSService<TUser, TToken>: WSServiceBase<TUser, TToken>
    {
        #region [ implement WSServiceBase ]
        public override string Name { get { return "custom"; } }
        #endregion

        #region [ constructor ]
        public CustomWSService(RestClient<TUser, TToken> rest, HubClient<TUser, TToken> hub)
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
        public Task check() { return Request( "check", null, null  ); }

        // isAuth: false
        public Task<bool> removeCollection() { return Request<bool>( "removeCollection", null, null  ); }

        // isAuth: false
        public Task<List<User>> createManyUsers() { return Request<List<User>>( "createManyUsers", null, null  ); }
        #endregion
    }
}
