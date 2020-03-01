using Newtonsoft.Json.Linq;

namespace nex.ws
{
    public class RestProtocolRequest<TRequest>: IId
    {
        public string id { get; set; }
        public string module { get; set; }
        public TRequest data { get; set; }
    }
}