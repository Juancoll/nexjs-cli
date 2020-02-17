namespace nex.ws
{
    public class RestResponseError
    {
        public RestResponse Response { get;  }
        public string Error { get;  }

        public RestResponseError(RestResponse res, string error)
        {
            Response = res;
            Error = error;
        }

    }
}
