using System.Collections.Generic;

namespace demo.wsclient
{
    public class WSServiceDescriptor
    {
        public string Name { get; set; }
        public List<HubDescriptor> Hubs { get; set; }
        public List<RestDescriptor> Rests { get; set; }
    }
}
