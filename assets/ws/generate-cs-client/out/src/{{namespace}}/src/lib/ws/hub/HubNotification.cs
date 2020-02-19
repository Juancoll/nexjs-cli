using Newtonsoft.Json.Linq;
using nex.types;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace nex.ws
{
    public class HubNotificationCredentialsData<TCredentials, TData>
    {
        #region [ fields ]   
   
        HubClient _hub;
        List<Action<TData>> _actions = new List<Action<TData>>();
        Dictionary<object, List<Action<TData>>> _groups = new Dictionary<object, List<Action<TData>>>();
        #endregion

        #region [ properties ]
        string _event;
        string _service;
        public string Service { get { return _service; } }
        public string Event { get { return _event; } }
        public event EventHandler<EventArgs<Exception>> EventException;
        #endregion

        #region [ constructor ]
        public HubNotificationCredentialsData(HubClient hub, string service, string eventName)
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
                        TData data = (e.Value.data == null)
                            ? default(TData)
                            : (e.Value.data is JToken)
                                ? (e.Value.data as JToken).ToObject<TData>()
                                : (TData)e.Value.data;

                        action(data);
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
        public HubNotificationCredentialsData<TCredentials, TData> On(Action<TData> action)
        {
            _actions.Add(action);
            return this;
        }
        public HubNotificationCredentialsData<TCredentials, TData> On(object group, Action<TData> action)
        {
            _actions.Add(action);
            
            if (!_groups.ContainsKey(group))
                _groups.Add(group, new List<Action<TData>>());

            _groups[group].Add(action);
            
            return this;
        }

        public HubNotificationCredentialsData<TCredentials, TData> off()
        {
            _actions.Clear();
            _groups.Clear();
            return this;
        }
        public HubNotificationCredentialsData<TCredentials, TData> off(object group)
        {
            if (_groups.ContainsKey(group))
            {
                foreach(var action in _groups[group].ToArray())                
                    _actions.Remove(action);
                
                _groups.Remove(group);
            }       
            return this;
        }
        public HubNotificationCredentialsData<TCredentials, TData> off(Action<TData> action)
        {
            if (_actions.Contains(action))
                _actions.Remove(action);

            foreach(var keyValue in _groups)
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

    public class HubNotificationCredentials<TCredentials>
    {
        #region [ fields ]   
        HubClient _hub;
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
        public HubNotificationCredentials(HubClient hub, string service, string eventName)
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
        public HubNotificationCredentials<TCredentials> On(Action action)
        {
            _actions.Add(action);
            return this;
        }
        public HubNotificationCredentials<TCredentials> On(object group, Action action)
        {
            _actions.Add(action);

            if (!_groups.ContainsKey(group))
                _groups.Add(group, new List<Action>());

            _groups[group].Add(action);

            return this;
        }

        public HubNotificationCredentials<TCredentials> off()
        {
            _actions.Clear();
            _groups.Clear();
            return this;
        }
        public HubNotificationCredentials<TCredentials> off(object group)
        {
            if (_groups.ContainsKey(group))
            {
                foreach (var action in _groups[group].ToArray())
                    _actions.Remove(action);

                _groups.Remove(group);
            }
            return this;
        }
        public HubNotificationCredentials<TCredentials> off(Action action)
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
    
    public class HubNotificationData<TData>
    {
        #region [ fields ]   
        HubClient _hub;
        List<Action<TData>> _actions = new List<Action<TData>>();
        Dictionary<object, List<Action<TData>>> _groups = new Dictionary<object, List<Action<TData>>>();
        #endregion

        #region [ properties ]
        string _event;
        string _service;
        public string Service { get { return _service; } }
        public string Event { get { return _event; } }
        public event EventHandler<EventArgs<Exception>> EventException;
        #endregion

        #region [ constructor ]
        public HubNotificationData(HubClient hub, string service, string eventName)
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
                        TData data = e.Value.data == null
                        ? default(TData)
                        : e.Value.data is JToken
                            ? (e.Value.data as JToken).ToObject<TData>()
                            : (TData)e.Value.data;

                        action(data);
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
        public HubNotificationData<TData> On(Action<TData> action)
        {
            _actions.Add(action);
            return this;
        }
        public HubNotificationData<TData> On(object group, Action<TData> action)
        {
            _actions.Add(action);

            if (!_groups.ContainsKey(group))
                _groups.Add(group, new List<Action<TData>>());

            _groups[group].Add(action);

            return this;
        }

        public HubNotificationData<TData> off()
        {
            _actions.Clear();
            _groups.Clear();
            return this;
        }
        public HubNotificationData<TData> off(object group)
        {
            if (_groups.ContainsKey(group))
            {
                foreach (var action in _groups[group].ToArray())
                    _actions.Remove(action);

                _groups.Remove(group);
            }
            return this;
        }
        public HubNotificationData<TData> off(Action<TData> action)
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

        public Task Subscribe()
        {
            return _hub.Subscribe(Service, Event, null);
        }
        public Task Unsubscribe()
        {
            return _hub.Unsubscribe(Service, Event);
        }
        #endregion
    }

    public class HubNotification
    {
        #region [ fields ]   
        HubClient _hub;
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
        public HubNotification(HubClient hub, string service, string eventName)
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
        public HubNotification On(Action action)
        {
            _actions.Add(action);
            return this;
        }
        public HubNotification On(object group, Action action)
        {
            _actions.Add(action);

            if (!_groups.ContainsKey(group))
                _groups.Add(group, new List<Action>());

            _groups[group].Add(action);

            return this;
        }

        public HubNotification off()
        {
            _actions.Clear();
            _groups.Clear();
            return this;
        }
        public HubNotification off(object group)
        {
            if (_groups.ContainsKey(group))
            {
                foreach (var action in _groups[group].ToArray())
                    _actions.Remove(action);

                _groups.Remove(group);
            }
            return this;
        }
        public HubNotification off(Action action)
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

        public Task Subscribe()
        {
            return _hub.Subscribe(Service, Event, null);
        }
        public Task Unsubscribe()
        {
            return _hub.Unsubscribe(Service, Event);
        }
        #endregion
    }
}
