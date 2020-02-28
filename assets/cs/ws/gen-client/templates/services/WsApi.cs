using nex.ws;

namespace template.api.wsclient
{
    public class WSApi<TUser, TToken> : WSApiBase<TUser, TToken>
    {
        #region [ private ]
        private DemoWSService<TUser, TToken> _demo;
        #endregion

        #region [ services ]
        public DemoWSService<TUser, TToken> demo { get { return _demo; } }
        #endregion

        #region [ constructor ]
        public WSApi()
        {
            _demo = new DemoWSService<TUser, TToken>(Rest, Hub);
        }
        #endregion
    }
}
