using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using nex.ws;

namespace template.api.wsclient
{
    public class UsersWSService<TUser, TToken>: WSServiceBase<TUser, TToken>
    {
        #region [ implement WSServiceBase ]
        public override string Name { get { return "users"; } }
        #endregion

        #region [ constructor ]
        public UsersWSService(RestClient<TUser, TToken> rest, HubClient<TUser, TToken> hub)
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
        public Task<List<User>> list() { return Request<List<User>>( "list", null, null  ); }

        // isAuth: false
        public Task<User> findById() { return Request<User>( "findById", null, null  ); }

        // isAuth: false
        public Task<User> findOne() { return Request<User>( "findOne", null, null  ); }

        // isAuth: false
        public Task<List<User>> findMany() { return Request<List<User>>( "findMany", null, null  ); }

        // isAuth: false
        public Task<double> updateQuery() { return Request<double>( "updateQuery", null, null  ); }

        // isAuth: false
        public Task<User> updateModel() { return Request<User>( "updateModel", null, null  ); }
        #endregion
    }
}
