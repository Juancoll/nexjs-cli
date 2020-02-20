using System;
using System.Collections.Generic;
using System.Linq;

namespace nex.types
{
    public interface IEmitter
    {
        Emitter emit(string eventName, object args);
        bool hasListeners(string eventName);
        List<Action<object>> listeners(string eventName);
        Emitter off();
        Emitter off(string eventName);
        Emitter off(string eventName, Action<object> action);
        Emitter on(string eventName, Action<object> action);
        Emitter once(string eventName, Action<object> action);
    }

    public class Emitter : IEmitter
    {
        #region[ class ]
        class Listener
        {
            Emitter _emitter;
            string _eventName;
            Action<object> _action;

            public Emitter Emitter { get { return _emitter; } }
            public string EventName { get { return _eventName; } }
            public Action<object> Action { get { return _action; } }

            public Listener(Emitter emitter, string eventName, Action<object> action)
            {
                _eventName = eventName;
                _emitter = emitter;
                _action = action;
            }
            virtual public void Call(object arg)
            {
                Action(arg);
            }
        }
        class OnceListener : Listener
        {

            public OnceListener(Emitter emitter, string eventName, Action<object> action)
                : base(emitter, eventName, action)
            {
            }
            public override void Call(object arg)
            {
                Emitter.off(EventName, Action);
                base.Call(arg);
            }
        }
        #endregion

        #region [ fields ]
        private Dictionary<string, List<Listener>> _callbacks = new Dictionary<string, List<Listener>>();
        #endregion

        #region [ properties ]
        public Logger Logger { get; set; }
        #endregion

        #region [ constructor ]
        public Emitter()
        {
            Logger = new Logger(this.GetType().Name);
        }
        #endregion

        #region [ public ]
        public Emitter on(string eventName, Action<object> action)
        {
            Logger.Log(string.Format("Emitter.on('{0}')", eventName));

            if (!_callbacks.ContainsKey(eventName))
                _callbacks.Add(eventName, new List<Listener>());

            _callbacks[eventName].Add(new Listener(this, eventName, action));
            return this;
        }
        public Emitter once(string eventName, Action<object> action)
        {
            Logger.Log(string.Format("Emitter.once('{0}')", eventName));

            if (!_callbacks.ContainsKey(eventName))
                _callbacks.Add(eventName, new List<Listener>());

            _callbacks[eventName].Add(new OnceListener(this, eventName, action));
            return this;
        }
        public Emitter off(string eventName, Action<object> action)
        {
            Logger.Log(string.Format("Emitter.off('{0}', action)", eventName));
            if (_callbacks.ContainsKey(eventName))
            {
                var foundAction = _callbacks[eventName].Find(x => x.Action == action);
                if (foundAction != null)
                {
                    _callbacks[eventName].Remove(foundAction);
                }
            }
            return this;
        }
        public Emitter off(string eventName)
        {
            Logger.Log(string.Format("Emitter.off('{0}')", eventName));
            if (_callbacks.ContainsKey(eventName))
            {
                _callbacks.Remove(eventName);
            }
            return this;
        }
        public Emitter off()
        {
            Logger.Log("Emitter.off()");
            _callbacks.Clear();
            return this;
        }
      
        public List<Action<object>> listeners(string eventName)
        {
            return _callbacks.ContainsKey(eventName)
                ? _callbacks[eventName].Select(x => x.Action).ToList()
                : new List<Action<object>>();
        }
        public bool hasListeners(string eventName)
        {
            return _callbacks.ContainsKey(eventName) && _callbacks[eventName].Any();
        }
        #endregion

        #region [ protected ]
        public Emitter emit(string eventName, object args = null)
        {
            var strData = args == null
                ? "null"
                : args is string
                    ? args as string
                    : "{ ... }";
            Logger.Log(string.Format("Emitter.emit '{0}' {1}", eventName, strData));

            if (_callbacks.ContainsKey(eventName))
            {
                foreach (var listener in _callbacks[eventName])
                {
                    listener.Call(args);
                }
            }
            return this;
        }
        #endregion
    }
}
