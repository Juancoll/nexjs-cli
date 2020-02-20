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
                throw new Exception(string.Format("[RequestQueue] already contains id '{0}'", id));

            _requests.Add(id, new Request());
        }
        public bool IsDone(RestMessage msg)
        {
            var id = GetId(msg);
            if (!_requests.ContainsKey(id))
                throw new Exception(string.Format("[RequestQueue] not contains id '{0}'", id));

            return _requests[id].Done;
        }
        public void Receive(RestResponse response)
        {
            var id = GetId(response);
            if (!_requests.ContainsKey(id))
                throw new Exception(string.Format("[RequestQueue] not contains id '{0}'", id));

            _requests[id].Done = true;
            _requests[id].Response = response;
        }
        public RestResponse Dequeue(RestMessage msg)
        {
            var id = GetId(msg);
            if (!_requests.ContainsKey(id))
                throw new Exception(string.Format("[RequestQueue] not contains id '{0}'", id));

            var data = _requests[id].Response;
            _requests.Remove(id);
            return data;
        }

        public string GetId(RestMessage msg)
        {
            return string.Format("#{0}.{1}", msg.service, msg.method);
        }
        #endregion
    }
    #endregion
}
