using Newtonsoft.Json.Linq;

namespace nex.socketio
{
    public class SocketIOEvent
    {
        public string Name { get; }
        public JToken Data { get; }

        public SocketIOEvent(string name, JToken data)
        {
            Name = name;
            Data = data;
        }
    }
}
