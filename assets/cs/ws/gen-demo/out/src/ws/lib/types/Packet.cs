namespace nex.types
{
    public abstract class Packet
    {
        public string RawData { get; protected set; }
        public object Data { get; protected set; }

        public abstract string Serialise();
    }
}
