using Newtonsoft.Json.Linq;

namespace nex.socketio
{
    public class SocketIOEvent
    {
        string _name;
        JToken _data;

        public string Name { get { return _name; } }
        public JToken Data { get { return _data; } }

        public SocketIOEvent(string name, JToken data)
        {
            _name = name;
            _data = data;
        }
    }
}
