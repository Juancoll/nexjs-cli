using nex.types;
using System;
using System.Threading.Tasks;

namespace nex.ws
{
    public interface IAuthClient<TUser, TToken>
    {
        AuthInfo<TUser, TToken> AuthInfo { get; }
        event EventHandler<EventArgs<bool>> EventAuthenticateChange;

        Task<AuthInfo<TUser, TToken>> Register(object data);
        Task<AuthInfo<TUser, TToken>> Login(object data);
        Task Logout();
        Task<AuthInfo<TUser, TToken>> Authenticate(TToken token);
    }
}
