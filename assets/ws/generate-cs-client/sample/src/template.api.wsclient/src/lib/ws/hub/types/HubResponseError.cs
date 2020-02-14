namespace nex.ws
{
    public class HubResponseError
    {
        public HubResponse Response { get;  }
        public string Error { get;  }

        public HubResponseError(HubResponse res, string error)
        {
            Response = res;
            Error = error;
        }

    }
}
