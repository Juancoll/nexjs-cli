namespace nex.ws
{
    public class RestResponseError
    {
        private RestResponse _response;
        private string _error;

        public RestResponse Response { get { return _response; }  }
        public string Error { get { return _error; } }

        public RestResponseError(RestResponse res, string error)
        {
            _response = res;
            _error = error;
        }

    }
}
