namespace nex.ws
{
    public class HubEventMessage
    {
        public string service { get; set; }
        public string eventName { get; set; }
        public object data { get; set; }
    }
}
