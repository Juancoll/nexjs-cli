namespace nex.ws
{
    public class RestRequest
    {
        public string service { get; set; }
        public string method { get; set; }
        public object data { get; set; }
        public object credentials { get; set; }
    }
}
