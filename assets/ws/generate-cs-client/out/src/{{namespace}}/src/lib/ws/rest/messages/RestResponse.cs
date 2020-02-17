namespace nex.ws
{
    public class RestResponse : RestMessage
    {
        public bool isSuccess { get; set; }
        public WSError error { get; set; }
    }
}
