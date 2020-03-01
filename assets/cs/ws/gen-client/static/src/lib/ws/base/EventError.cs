using System;

namespace nex.ws
{
    public class EventError
    {
        public string Name { get; set; }
        public Exception Exception { get; set; }
        public EventError(string name, Exception ex)
        {
            Name = name;
            Exception = ex;
        }
    }
}
