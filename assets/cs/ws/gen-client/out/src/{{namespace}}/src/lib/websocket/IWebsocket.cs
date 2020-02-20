using nex.types;
using System;

namespace nex.websocket
{
    public interface IWebsocket
    {
        Logger Logger { get; set; }
        string url { get; }
        ReadyState readyState { get; }

        event EventHandler onopen;
        event EventHandler<EventArgs<string>> onerror;
        event EventHandler<EventArgs<CloseState>> onclose;
        event EventHandler<EventArgs<Message>> onmessage;

        void connect(string url);
        void close(string reason);
        void Send(string data);
        void Send(byte[] data);
    }
}
