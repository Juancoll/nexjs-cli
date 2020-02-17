using nex.ws;
using System.Threading.Tasks;

namespace template.api.wsclient
{
    public class UserWSService : WSServiceBase
    {
        #region [ implement WSServiceBase ]
        public override string Name => "user";
        #endregion

        #region [ constructor ]
        public UserWSService(RestClient rest, HubClient hub)
            :base(rest, hub)
        {
            onUserUpdate = new HubNotification<string, User>(hub, Name, "onUserUpdate");
        }
        #endregion

        #region [ hub ]
        public HubNotification<string, User> onUserUpdate { get; }
        #endregion

        #region [ rest ]
        public Task<string> funcA() { return Request<string>("funcA", null, null); } 
        public Task<string> funcB(string name, string surname, string email) { return Request<string>("funcB", new { name, surname, email }, null ); }
        public Task<User> changeUser(string name, string surname) { return Request<User>("changeUser", new { name, surname }, null); }
        #endregion
    }
}
