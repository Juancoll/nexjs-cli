using Newtonsoft.Json.Linq;
using nex.types;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace nex.ws
{
    public class HubNotificationCredentialsData<TCredentials, TData>
    {
        #region [ fields ]   
        HubClient _hub;
        List<Action<TData>> _actions = new List<Action<TData>>();
        #endregion

        #region [ properties ]
        public string Service { get; }
        public string Event { get; }
        public event EventHandler<EventArgs<Exception>> EventException;
        #endregion

        #region [ constructor ]
        public HubNotificationCredentialsData(HubClient hub, string service, string eventName)
        {
            _hub = hub;
            Service = service;
            Event = eventName;
            hub.EventReceive += (s, e) =>
            {
                if (e.Value.service != service || e.Value.eventName != Event)
                    return;

                foreach (var action in _actions)
                {
                    try
                    {
                        TData data = e.Value.data == null 
                        ? default
                        : e.Value.data is JToken
                            ? (e.Value.data as JToken).ToObject<TData>()
                            : (TData)e.Value.data;

                        action(data);
                    }
                    catch (Exception ex)
                    {
                        EventException?.Invoke(this, new EventArgs<Exception>(ex));
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
        public HubNotificationCredentialsData<TCredentials, TData> off()
        {
            _actions.Clear();
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
        #endregion

        #region [ properties ]
        public string Service { get; }
        public string Event { get; }
        public event EventHandler<EventArgs<Exception>> EventException;
        #endregion

        #region [ constructor ]
        public HubNotificationCredentials(HubClient hub, string service, string eventName)
        {
            _hub = hub;
            Service = service;
            Event = eventName;
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
                        EventException?.Invoke(this, new EventArgs<Exception>(ex));
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
        public HubNotificationCredentials<TCredentials> off()
        {
            _actions.Clear();
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
        #endregion

        #region [ properties ]
        public string Service { get; }
        public string Event { get; }
        public event EventHandler<EventArgs<Exception>> EventException;
        #endregion

        #region [ constructor ]
        public HubNotificationData(HubClient hub, string service, string eventName)
        {
            _hub = hub;
            Service = service;
            Event = eventName;
            hub.EventReceive += (s, e) =>
            {
                if (e.Value.service != service || e.Value.eventName != Event)
                    return;

                foreach (var action in _actions)
                {
                    try
                    {
                        TData data = e.Value.data == null
                        ? default
                        : e.Value.data is JToken
                            ? (e.Value.data as JToken).ToObject<TData>()
                            : (TData)e.Value.data;

                        action(data);
                    }
                    catch (Exception ex)
                    {
                        EventException?.Invoke(this, new EventArgs<Exception>(ex));
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
        public HubNotificationData<TData> off()
        {
            _actions.Clear();
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
        #endregion

        #region [ properties ]
        public string Service { get; }
        public string Event { get; }
        public event EventHandler<EventArgs<Exception>> EventException;
        #endregion

        #region [ constructor ]
        public HubNotification(HubClient hub, string service, string eventName)
        {
            _hub = hub;
            Service = service;
            Event = eventName;
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
                        EventException?.Invoke(this, new EventArgs<Exception>(ex));
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
        public HubNotification off()
        {
            _actions.Clear();
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
