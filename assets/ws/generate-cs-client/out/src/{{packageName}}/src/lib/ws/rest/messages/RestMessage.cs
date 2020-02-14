using Newtonsoft.Json.Linq;

namespace nex.ws
{
    public class RestMessage
    {
        public string service { get; set; }
        public string method { get; set; }
        public object data { get; set; }
    }
}
