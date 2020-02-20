namespace nex.ws
{
    public class HubResponseError
    {
        HubResponse _response;
        string _error;

        public HubResponse Response { get { return _response; }  }
        public string Error { get { return _error; }  }

        public HubResponseError(HubResponse res, string error)
        {
            _response = res;
            _error = error;
        }
    }
}
