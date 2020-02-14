namespace nex.ws
{
    public class WSError
    {
        public WSErrorCode Code { get; set; }
        public string Message { get; set; }
        public WSError(WSErrorCode code, string msg)
        {
            Code = code;
            Message = msg;
        }
    }
}
