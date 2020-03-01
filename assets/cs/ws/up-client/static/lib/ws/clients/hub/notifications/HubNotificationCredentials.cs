using Newtonsoft.Json.Linq;
using nex.types;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace nex.ws
{
    public class HubNotificationCredentials<TUser, TToken, TCredentials>
    {
        #region [ fields ]   
        HubClient<TUser, TToken> _hub;
        List<Action> _actions = new List<Action>();
        Dictionary<object, List<Action>> _groups = new Dictionary<object, List<Action>>();
        #endregion

        #region [ properties ]
        string _event;
        string _service;
        public string Service { get { return _service; } }
        public string Event { get { return _event; } }
        public event EventHandler<EventArgs<Exception>> EventException;
        #endregion

        #region [ constructor ]
        public HubNotificationCredentials(HubClient<TUser, TToken> hub, string service, string eventName)
        {
            _hub = hub;
            _service = service;
            _event = eventName;
            hub.EventReceive += (s, e) =>
            {
                if (e.Value.service != service || e.Value.eventName != Event)
                    return;

                foreach (var action in _actions)
                {
                    try
                    {                        
                        action();
                    }
                    catch (Exception ex)
                    {
                        if (EventException != null) EventException(this, new EventArgs<Exception>(ex));
                    }
                }
            };
        }
        #endregion

        #region [ methods ]
        public HubNotificationCredentials<TUser, TToken, TCredentials> On(Action action)
        {
            _actions.Add(action);
            return this;
        }
        public HubNotificationCredentials<TUser, TToken, TCredentials> On(object group, Action action)
        {
            _actions.Add(action);

            if (!_groups.ContainsKey(group))
                _groups.Add(group, new List<Action>());

            _groups[group].Add(action);

            return this;
        }

        public HubNotificationCredentials<TUser, TToken, TCredentials> off()
        {
            _actions.Clear();
            _groups.Clear();
            return this;
        }
        public HubNotificationCredentials<TUser, TToken, TCredentials> off(object group)
        {
            if (_groups.ContainsKey(group))
            {
                foreach (var action in _groups[group].ToArray())
                    _actions.Remove(action);

                _groups.Remove(group);
            }
            return this;
        }
        public HubNotificationCredentials<TUser, TToken, TCredentials> off(Action action)
        {
            if (_actions.Contains(action))
                _actions.Remove(action);

            foreach (var keyValue in _groups)
            {
                var key = keyValue.Key;
                var value = keyValue.Value;
                if (value.Contains(action))
                {
                    _groups[key].Remove(action);
                }
            }

            var emptyKeys = _groups.Where(x => x.Value.Count == 0).Select(x => x.Key).ToList();
            emptyKeys.ForEach(key => _groups.Remove(key));

            return this;
        }

        public Task Subscribe(TCredentials credentials = default(TCredentials))
        {
            return _hub.Subscribe(Service, Event, credentials);
        }
        public Task Unsubscribe()
        {
            return _hub.Unsubscribe(Service, Event);
        }
        #endregion
    }   
}
