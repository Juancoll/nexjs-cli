using System;

namespace template.api.wsclient
{
    public enum WSBaseLogType
    {
        log,
        error,
        warn
    }
    public class WSBaseLogEventArgs : EventArgs {
        public WSBaseLogType type { get; }
        public string msg { get; }
        public object data { get; }

        public WSBaseLogEventArgs(WSBaseLogType type, string msg, object data = null)
        {
            this.type = type;
            this.msg = msg;
            this.data = data;
        }
    }
    public abstract class WSBase
    {
        #region [ fiels ]
        private string _logId;
        #endregion

        #region [ properties ]
        public bool debug { get; set; }
        #endregion

        #region [ events ]
        public event EventHandler<WSBaseLogEventArgs> EventLog;
        #endregion

        #region [ constructor ]
        public WSBase(string id) {
            this.debug = false;
            this._logId = id;
        }
        #endregion

        #region [ log ]
        protected void log(string msg, object data = null)
        {
            if (this.debug)
            {
                EventLog?.Invoke(this, new WSBaseLogEventArgs(WSBaseLogType.log, msg, data));
            }
        }
        protected void error(string msg, object data = null)
        {
            if (this.debug)
            {
                EventLog?.Invoke(this, new WSBaseLogEventArgs(WSBaseLogType.error, msg, data));
            }
        }
        protected void warn(string msg, object data = null)
        {
            if (this.debug)
            {
                EventLog?.Invoke(this, new WSBaseLogEventArgs(WSBaseLogType.warn, msg, data));
            }
        }
        #endregion
    }
}
