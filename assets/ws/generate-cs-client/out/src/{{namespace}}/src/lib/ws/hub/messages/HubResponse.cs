namespace nex.ws
{
    public class HubResponse : HubRestMessage
    {
        public bool isSuccess { get; set; }
        public WSError error { get; set; }
    }
}
