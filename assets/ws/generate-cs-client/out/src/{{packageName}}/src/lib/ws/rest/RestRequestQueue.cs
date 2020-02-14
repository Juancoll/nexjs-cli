using System;
using System.Collections.Generic;

namespace nex.ws
{
    #region [ class ]
    public class RestRequestQueue
    {
        #region [ class ]
        class Request
        {
            public bool Done { get; set; }
            public RestResponse Response { get; set; }

            public Request()
            {
                Done = false;
                Response = null;
            }
        }
        #endregion

        #region [ fields ]
        private Dictionary<string, Request> _requests = new Dictionary<string, Request>();
        #endregion

        #region [ public ]
        public bool Contains(RestMessage msg)
        {
            return _requests.ContainsKey(GetId(msg));
        }
        public void Add(RestMessage msg)
        {
            var id = GetId(msg);
            if (_requests.ContainsKey(id))
                throw new Exception($"[RequestQueue] already contains id '{id}'");

            _requests.Add(id, new Request());
        }
        public bool IsDone(RestMessage msg)
        {
            var id = GetId(msg);
            if (!_requests.ContainsKey(id))
                throw new Exception($"[RequestQueue] not contains id '{id}'");

            return _requests[id].Done;
        }
        public void Receive(RestResponse response)
        {
            var id = GetId(response);
            if (!_requests.ContainsKey(id))
                throw new Exception($"[RequestQueue] not contains id '{id}'");

            _requests[id].Done = true;
            _requests[id].Response = response;
        }
        public RestResponse Dequeue(RestMessage msg)
        {
            var id = GetId(msg);
            if (!_requests.ContainsKey(id))
                throw new Exception($"[RequestQueue] not contains id '{id}'");

            var data = _requests[id].Response;
            _requests.Remove(id);
            return data;
        }

        public string GetId(RestMessage msg)
        {
            return $"#{msg.service}.{msg.method}";
        }
        #endregion
    }
    #endregion
}
