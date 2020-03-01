using System;
using System.Collections.Generic;

namespace nex.ws
{
    public class HubSubscriptionCollection
    {
        private List<HubRequest> _subscriptions = new List<HubRequest>();

        public bool Contains(HubRequest req)
        {
            var subscription = _subscriptions.Find(x => x.service == req.service && x.eventName == req.eventName);
            return subscription != null;
        }
        public void Add(HubRequest req)
        {
            if (Contains(req))
                throw new Exception("[HubSubscriptionCollection] Already exists");

            _subscriptions.Add(req);
        }
        public void Remove(HubRequest req)
        {
            if (!Contains(req))
                throw new Exception("[HubSubscriptionCollection] not found");

            var item = this[req];
            _subscriptions.Remove(item);
        }
        public void Update(HubRequest req)
        {
            if (!Contains(req))
                throw new Exception("[HubSubscriptionCollection] not found");

            this[req].credentials = req.credentials;
        }
        public IEnumerable<HubRequest> List()
        {
            return _subscriptions;
        }

        private HubRequest this[HubRequest req]
        {
            get
            {
                if (!Contains(req))
                    throw new Exception("[HubSubscriptionCollection] not found");

                return _subscriptions.Find(x => x.service == req.service && x.eventName == req.eventName);
            }
        }
    }
}
