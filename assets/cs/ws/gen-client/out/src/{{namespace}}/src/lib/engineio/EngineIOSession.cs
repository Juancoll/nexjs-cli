using System.Collections.Generic;

namespace nex.engineio
{
    public class EngineIOSession
    {
        public string sid { get; set; }
        public List<string> upgrades { get; set; }
        public int pingTimeout { get; set; }
        public int pingInterval { get; set; }
    }
}
