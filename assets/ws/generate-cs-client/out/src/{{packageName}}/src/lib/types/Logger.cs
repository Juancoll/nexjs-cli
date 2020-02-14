
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
        public LogType Type { get; }
        public string Id { get; }
        public string Message { get; }
        public object Data { get; }

        public LoggerMessage(LogType type, string id, string msg, object data = null)
        {
            Type = type;
            Id = id;
            Message = msg;
            Data = data;
        }
    }

    public class Logger
    {
        #region[ properties ]
        public string Id { get; }
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
            Id = id;
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
                EventLog?.Invoke(this, new EventArgs<LoggerMessage>(msg));
            }
            if (EnableConsole)
            {
                Console.WriteLine($"[{msg.Type}][{msg.Id}] {msg.Message}");
            }
        }
        #endregion
    }
}
