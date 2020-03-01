using System;

namespace nex.ws
{
    public class HubSubscriptionError
    {
        public HubRequest Request { get; set; }
        public Exception Exception { get; set; }

        public HubSubscriptionError(HubRequest request, Exception ex)
        {
            Request = request;
            Exception = ex;
        }
    }
}
