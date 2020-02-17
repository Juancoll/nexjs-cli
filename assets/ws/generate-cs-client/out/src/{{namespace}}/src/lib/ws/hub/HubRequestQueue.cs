using System;
using System.Collections.Generic;

namespace nex.ws
{
    #region [ class ]
    public class HubRequestQueue
    {
        #region [ class ]
        class Request
        {
            public bool Done { get; set; }
            public HubResponse ResponseData { get; set; }

            public Request()
            {
                Done = false;
                ResponseData = null;
            }
        }
        #endregion

        #region [ fields ]
        private Dictionary<string, Request> _request = new Dictionary<string, Request>();
        #endregion

        #region [ public ]
        public bool Contains(HubRestMessage msg)
        {
            return _request.ContainsKey(GetId(msg));
        }
        public void Add(HubRestMessage msg)
        {
            var id = GetId(msg);
            if (_request.ContainsKey(id))
                throw new Exception($"[RequestQueue] already contains id '{id}'");

            _request.Add(id, new Request());
        }
        public bool IsDone(HubRestMessage msg)
        {
            var id = GetId(msg);
            if (!_request.ContainsKey(id))
                throw new Exception($"[RequestQueue] not contains id '{id}'");

            return _request[id].Done;
        }
        public void Receive(HubResponse response)
        {
            var id = GetId(response);
            if (!_request.ContainsKey(id))
                throw new Exception($"[RequestQueue] not contains id '{id}'");

            _request[id].Done = true;
            _request[id].ResponseData = response;
        }
        public HubResponse Dequeue(HubRestMessage msg)
        {
            var id = GetId(msg);
            if (!_request.ContainsKey(id))
                throw new Exception($"[RequestQueue] not contains id '{id}'");

            var data = _request[id].ResponseData;
            _request.Remove(id);
            return data;
        }

        public string GetId(HubRestMessage msg)
        {
            return $"#{msg.method}::{msg.service}.{msg.eventName}";
        }
        #endregion
    }
    #endregion
}
