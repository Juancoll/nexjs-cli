using Newtonsoft.Json.Linq;

namespace nex.ws
{
    public class RestProtocolResponse<TResponse> : IId
    {
        public string id { get; set; }
        public string module { get; set; }
        public TResponse data { get; set; }
        public bool isSuccess { get; set; }
        public WSError error { get; set; }
    }
}