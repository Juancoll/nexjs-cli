using Newtonsoft.Json.Linq;
using nex.types;
using System;
using System.Threading.Tasks;

namespace nex.ws
{
    public class AuthClient<TUser, TToken> : WSClientBase<TUser, TToken>, IAuthClient<TUser, TToken>
    {

        #region [ fields ]
        private bool _isAuthenticate;
        private AuthInfo<TUser, TToken> _authInfo;
        private RestProtocolClient<AuthRequest, AuthResponse<TUser, TToken>> _restProtocol;
        #endregion

        #region [ properties ]
        public bool IsAuthenticate { get { return _isAuthenticate; } }
        public int DefaultRequestTimeout { get { return Ws.DefaultRequestTimeout; } set { Ws.DefaultRequestTimeout = value; } }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<WSError>> EventWSError;
        public event EventHandler<EventArgs<RestProtocolResponseError<AuthResponse<TUser, TToken>>>> EventResponseError;
        #endregion

        #region [ constructor ]
        public AuthClient(WSApiBase<TUser, TToken> api, IWSBase ws) 
            : base(api, ws)
        {
            _restProtocol = new RestProtocolClient<AuthRequest, AuthResponse<TUser,TToken>>(ws, "auth");
            _restProtocol.EventWSError += (s, e) => { if (EventWSError != null) EventWSError(this, e); };
            _restProtocol.EventResponseError += (s, e) => { if (EventResponseError != null) EventResponseError(this, e); };
            ws.EventReconnected += async (s, e) =>
            {
                if (this.AuthInfo != null)
                {
                    try
                    {
                        await Authenticate(AuthInfo.token);
                    }
                    catch (Exception ex)
                    {

                        if (EventWSError != null) EventWSError(this, new EventArgs<WSError>(new WSError(WSErrorCode.ws_auth_invalid_credentials, ex.Message)));
                    }
                }
                else
                {
                    SetIsAuthenticate(false);
                }
            };
            ws.EventDisconnect += (s, e) => SetIsAuthenticate(false);
        }
        #endregion

        #region [ public ]
        public void Init()
        {
            _restProtocol.Init();
        }
        #endregion


        #region [ implements IAuthClient ]
        public AuthInfo<TUser, TToken> AuthInfo { get { return _authInfo; } }
        public event EventHandler<EventArgs<bool>> EventAuthenticateChange;

        public async Task<AuthInfo<TUser, TToken>> Register(object data)
        {
            if (IsAuthenticate) throw new Exception(string.Format("logout required"));

            _authInfo = await this._restProtocol.RequestDataAsync(new AuthRequest { method = "register", data = data });
            if (_authInfo != null)
            {
                SetIsAuthenticate(true);
                return _authInfo;
            }
            else
            {
                SetIsAuthenticate(false);
                throw new Exception("no auth info");
            }
        }
      
        public async Task<AuthInfo<TUser, TToken>> Login(object data)
        {
            if (IsAuthenticate) throw new Exception(string.Format("logout required"));

            _authInfo = await this._restProtocol.RequestDataAsync(new AuthRequest { method = "login", data = data });
            if (_authInfo != null)
            {
                SetIsAuthenticate(true);
                return _authInfo;
            }
            else
            {
                SetIsAuthenticate(false);
                throw new Exception("no auth info");
            }
        }

        public async Task Logout()
        {
            await this._restProtocol.RequestAsync(new AuthRequest { method = "logout", });
            SetIsAuthenticate(false);
        }

        public async Task<AuthInfo<TUser, TToken>> Authenticate(TToken token)
        {
            try
            {
                _authInfo = await _restProtocol.RequestDataAsync( new AuthRequest { method = "authenticate", data = token });
                if (_authInfo != null)
                {
                    SetIsAuthenticate(true);
                    return _authInfo;
                }
                else
                {
                    throw new Exception("no auth info");
                }
            }
            catch (Exception ex)
            {
                _authInfo = null;
                SetIsAuthenticate(false);
                throw ex;
            }
        }
        #endregion

        #region [ private ]
        private void SetIsAuthenticate(bool value)
        {
            _isAuthenticate = value;
            if (EventAuthenticateChange != null )EventAuthenticateChange(this, new EventArgs<bool>(value));   
            if (value == false)
            {
                this._authInfo = null;
            }
        }
        #endregion
    }
}
