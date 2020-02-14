namespace nex.websocket
{
    public class CloseState
    {
        public uint code { get; set; }
        public string reason { get; set; }
        public bool wasClean { get; set; }
    }
}
