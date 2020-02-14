﻿using Newtonsoft.Json.Linq;
using nex.types;
using System;
using System.Threading.Tasks;

namespace nex.ws
{
    public interface IWSBase
    {
        #region [ properties ]
        string Id { get; }
        int DefaultRequestTimeout { get; set; }
        bool IsConnected { get; }
        string Url { get; }
        string Nsp { get; }
        #endregion

        #region [ events ]
        event EventHandler<EventArgs<EventData>> EventSend;
        event EventHandler<EventArgs<EventData>> EventReceive;
        event EventHandler<EventArgs<bool>> EventConnectionChange;
        event EventHandler<EventArgs> EventNewSocketInstance;
        event EventHandler<EventArgs<EventError>> EventSubscriptionError;
        event EventHandler<EventArgs<NestJSWSException>> EventNestJSException;
        #endregion

        #region [ methods ]
        void Connect(string url, string nsp, string authToken = null);
        void Disconnect();

        IWSBase Subscribe(string eventName, Action<JToken> action);
        void Publish(string eventName, object data = null);

        Task RequestAsync(string eventName, object data, int timeout);
        Task<T> RequestAsync<T>(string eventName, object data, int timeout);
        #endregion
    }
}