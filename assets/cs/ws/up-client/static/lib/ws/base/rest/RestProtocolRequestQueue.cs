using System;
using System.Collections.Generic;

namespace nex.ws
{
    #region [ class ]
    public class RestProtocolRequestQueue<TResponse>
    {
        #region [ class ]
        class Request
        {
            public bool Done { get; set; }
            public RestProtocolResponse<TResponse> Response { get; set; }

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
        public bool Contains(IId msg)
        {
            return _requests.ContainsKey(msg.id);
        }
        public void Add(IId msg)
        {
            var id = msg.id;
            if (_requests.ContainsKey(id))
                throw new Exception(string.Format("[RestProtocolQueue] already contains id '{0}'", id));

            _requests.Add(id, new Request());
        }
        public bool IsDone(IId msg)
        {
            var id = msg.id;
            if (!_requests.ContainsKey(id))
                throw new Exception(string.Format("[RestProtocolQueue] not contains id '{0}'", id));

            return _requests[id].Done;
        }
        public void Receive(RestProtocolResponse<TResponse> response)
        {
            var id = response.id;
            if (!_requests.ContainsKey(id))
                throw new Exception(string.Format("[RestProtocolQueue] not contains id '{0}'", id));

            _requests[id].Done = true;
            _requests[id].Response = response;
        }
        public RestProtocolResponse<TResponse> Dequeue(IId msg)
        {
            var id = msg.id;
            if (!_requests.ContainsKey(id))
                throw new Exception(string.Format("[RestProtocolQueue] not contains id '{0}'", id));

            var data = _requests[id].Response;
            _requests.Remove(id);
            return data;
        }
        #endregion
    }
    #endregion
}
