using Newtonsoft.Json.Linq;

namespace nex.ws
{
    public class EventData
    {
        public string Name { get; }
        public JToken Data { get; }

        public EventData(string name, JToken data)
        {
            Name = name;
            Data = data;
        }
    }
}
