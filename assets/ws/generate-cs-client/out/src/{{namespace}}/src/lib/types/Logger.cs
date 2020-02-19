
using System;

namespace nex.types
{
    public enum LogType
    {
        log,
        error,
        warn
    }

    public class LoggerMessage
    {
        LogType _type;
        string _id;
        string _message;
        object _data;

        public LogType Type { get { return _type ; } }
        public string Id { get { return _id; } }
        public string Message { get { return _message; } }
        public object Data { get { return _data; } }

        public LoggerMessage(LogType type, string id, string msg, object data = null)
        {
            _type = type;
            _id = id;
            _message = msg;
            _data = data;
        }
    }

    public class Logger
    {
        string _id;

        #region[ properties ]
        public string Id { get { return _id; } }
        public bool Enabled { get; set; }
        public bool EnableEvent { get; set; }
        public bool EnableConsole { get; set; }
        #endregion

        #region [ events ]
        public event EventHandler<EventArgs<LoggerMessage>> EventLog;
        #endregion

        #region [ constructor ]
        public Logger(string id)
        {
            _id = id;
            EnableConsole = true;
            EnableEvent = true;
            Enabled = false;
        }
        #endregion

        #region [ public ]
        public void Start() { Enabled = true; }
        public void Stop() { Enabled = false; }
        public void Log(string msg, object data = null)
        {
            Send(new LoggerMessage(LogType.log, Id, msg, data));
        }
        public void Error(string msg, object data = null)
        {
            Send(new LoggerMessage(LogType.error, Id, msg, data));
        }
        public void Warn(string msg, object data = null)
        {
            Send(new LoggerMessage(LogType.warn, Id, msg, data));
        }
        #endregion

        #region [ private ]
        private void Send(LoggerMessage msg)
        {
            if (!Enabled)
                return;

            if (EnableEvent)
            {
                if (EventLog != null) EventLog(this, new EventArgs<LoggerMessage>(msg));
            }
            if (EnableConsole)
            {
                Console.WriteLine(string.Format("[{0}][{1}] {2}", msg.Type, msg.Id, msg.Message));
            }
        }
        #endregion
    }
}
