namespace nex.ws
{
    public abstract class WSClientBase<TUser, TToken>
    {
        #region [ fields ]
        private IWSBase _ws;
        private WSApiBase<TUser, TToken> _api;
        #endregion

        #region [ properties ]
        protected IWSBase Ws { get { return _ws; } }
        protected WSApiBase<TUser, TToken> Api { get { return _api; } }
        #endregion

        #region [ constructor ]
        public WSClientBase(WSApiBase<TUser, TToken> api, IWSBase ws)
        {
            _api = api;
            _ws = ws;
        }
        #endregion
    }
}
