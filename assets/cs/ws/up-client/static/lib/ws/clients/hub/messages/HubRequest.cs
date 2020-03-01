namespace nex.ws
{
    public class HubRequest
    {
        public string service { get; set; }
        public string method { get; set; }
        public string eventName { get; set; }
        public object credentials { get; set; }
    }
}
