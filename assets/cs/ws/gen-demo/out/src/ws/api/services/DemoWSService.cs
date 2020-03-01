using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using nex.ws;

namespace template.api.wsclient
{
    public class DemoWSService<TUser, TToken>: WSServiceBase<TUser, TToken>
    {
        #region [ implement WSServiceBase ]
        public override string Name { get { return "demo"; } }
        #endregion

        #region [ constructor ]
        public DemoWSService(RestClient<TUser, TToken> rest, HubClient<TUser, TToken> hub)
            :base(rest, hub)
        {
            _onUpdate = new HubNotification<TUser, TToken>(hub, Name, "onUpdate");
            _onUpdateCredentials = new HubNotificationCredentials<TUser, TToken, int>(hub, Name, "onUpdateCredentials");
            _onUpdateCredentialsData = new HubNotificationCredentialsData<TUser, TToken, List<MyDTO>, MyDTO>(hub, Name, "onUpdateCredentialsData");
            _onUpdateData = new HubNotificationData<TUser, TToken, User>(hub, Name, "onUpdateData");
        }
        #endregion

        #region [ hub private ]
        private HubNotification<TUser, TToken> _onUpdate { get; }
        private HubNotificationCredentials<TUser, TToken, int> _onUpdateCredentials { get; }
        private HubNotificationCredentialsData<TUser, TToken, List<MyDTO>, MyDTO> _onUpdateCredentialsData { get; }
        private HubNotificationData<TUser, TToken, User> _onUpdateData { get; }
        #endregion

        #region [ hub public ]

        // isAuth: false
        public HubNotification<TUser, TToken> onUpdate { get { return _onUpdate; } }

        // isAuth: true
        public HubNotificationCredentials<TUser, TToken, int> onUpdateCredentials { get { return _onUpdateCredentials; } }

        // isAuth: true
        public HubNotificationCredentialsData<TUser, TToken, List<MyDTO>, MyDTO> onUpdateCredentialsData { get { return _onUpdateCredentialsData; } }

        // isAuth: true
        public HubNotificationData<TUser, TToken, User> onUpdateData { get { return _onUpdateData; } }
        #endregion

        #region [ rest ]

        // isAuth: false
        public Task<MyDTO> emitEvents() { return Request<MyDTO>( "emitEvents", null, null  ); }

        // isAuth: true
        public Task<int> funcA(string name, string surname, uint age) { return Request<int>( "funcA", new { name, surname, age }, null  ); }

        // isAuth: true
        public Task<string> funcB(MyDTO data, string credentials) { return Request<string>( "funcB", data, credentials  ); }

        // isAuth: true
        public Task<int> funcC(uint credentials) { return Request<int>( "funcC", null, credentials  ); }

        // isAuth: false
        public Task funcD(string data) { return Request( "funcD", data, null  ); }

        // isAuth: false
        public Task funcE(string data) { return Request( "funcE", data, null  ); }

        // isAuth: true
        public Task<User> changeUser(string name, string surname, Player player, Org org) { return Request<User>( "changeUser", new { name, surname, player, org }, null  ); }
        #endregion
    }
}
