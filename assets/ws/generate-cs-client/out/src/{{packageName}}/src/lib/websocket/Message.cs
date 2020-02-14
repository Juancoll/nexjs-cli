namespace nex.websocket
{
    public class Message
    {
        public bool IsBInary { get; set; }
        public bool IsPing { get; set; }
        public bool IsText { get; set; }
        public byte[] RawData { get; set; }
        public string Data { get; set; }
    }
}
