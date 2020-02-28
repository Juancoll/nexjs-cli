using System;

namespace nex.types
{
    public class EventArgs<T>: EventArgs
    {
        T _value;
        public T Value { get { return _value; } }
        public EventArgs(T value)
        {
            _value = value;
        }
    }
}
