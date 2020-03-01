using Newtonsoft.Json.Linq;

namespace nex.ws
{
    public class EventData
    {
        private string _name;
        private JToken _data;

        public string Name { get { return _name; } }
        public JToken Data { get { return _data; } }

        public EventData(string name, JToken data)
        {
            _name = name;
            _data = data;
        }
    }
}
