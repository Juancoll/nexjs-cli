using nex.ws;

namespace template.api.wsclient
{
    public class WSApi : WSClientBase
    {
        #region [ services ]
        public UserWSService user { get; }
        #endregion

        #region [ constructor ]
        public WSApi()
        {
            user = new UserWSService(Rest, Hub);
        }
        #endregion
    }
}
