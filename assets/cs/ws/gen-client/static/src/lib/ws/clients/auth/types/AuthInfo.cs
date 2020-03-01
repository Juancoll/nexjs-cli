namespace nex.ws
{
    public class AuthInfo<TUser, TToken>
    {
        public TUser user { get; set; }
        public TToken token { get; set; }
    }
}
