using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using nex.ws;

namespace template.api.wsclient
{
    public class JobsWSService<TUser, TToken>: WSServiceBase<TUser, TToken>
    {
        #region [ implement WSServiceBase ]
        public override string Name { get { return "jobs"; } }
        #endregion

        #region [ constructor ]
        public JobsWSService(RestClient<TUser, TToken> rest, HubClient<TUser, TToken> hub)
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
        public Task runJob() { return Request( "runJob", null, null  ); }

        // isAuth: false
        public Task start() { return Request( "start", null, null  ); }

        // isAuth: false
        public Task stop() { return Request( "stop", null, null  ); }
        #endregion
    }
}
