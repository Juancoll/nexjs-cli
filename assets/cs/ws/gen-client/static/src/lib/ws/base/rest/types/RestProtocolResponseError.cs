namespace nex.ws
{
    public class RestProtocolResponseError<TResponse>
    {
        public RestProtocolResponse<TResponse> Response { get; set; }
        public string Error { get; set; }

        public RestProtocolResponseError(RestProtocolResponse<TResponse> res, string error)
        {
            Response = res;
            Error = error;

        }
    }
}
