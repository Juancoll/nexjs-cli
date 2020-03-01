using System;
using {{name}};

namespace demo.wsclient
{
    public class Context
    {
        #region [ singleton ]
        private static Context _instance;

        private Context() { }

        public static Context Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new Context();
                    _instance.Initialize();
                }
                return _instance;
            }
        }
        #endregion

        #region [ properties ]
        public WSApi<User, string> wsapi { get; private set; }
        #endregion

        #region [ private ]
        private void Initialize()
        {
            wsapi = new WSApi<User, string>();

            wsapi.EventWSError += (s, e) =>
            {
                Console.WriteLine($"[wsapi] EventWSError code = {e.Value.Code}, message = {e.Value.Message}");
            };

            #region [ IWSBase events ]
            wsapi.Ws.EventConnectionChange += (s, e) =>
            {
                if (e.Value)
                    Console.WriteLine($"[IWSBase] connected '{e.Value}', id = {wsapi.Ws.Id}");
                else
                    Console.WriteLine($"[IWSBase] disconnected");
            };
            wsapi.Ws.EventSubscriptionError += (s, e) =>
            {
                Console.WriteLine($"[IWSBase] EventSubscriptionError event = {e.Value.Name}, error = {e.Value.Exception.Message}");
            };
            wsapi.Ws.EventNewSocketInstance += (s, e) =>
            {
                Console.WriteLine($"[IWSBase] EventNewSocketInstance");
            };
            wsapi.Ws.EventSend += (s, e) =>
            {
                var strData = e.Value.Data == null
                    ? "null"
                    : e.Value.Data.ToString();

                Console.WriteLine($"[IWSBase] EventSend event = {e.Value.Name}, data = {strData}");
            };
            wsapi.Ws.EventReceive += (s, e) =>
            {
                var strData = e.Value.Data == null
                    ? "null"
                    : e.Value.Data.ToString();

                Console.WriteLine($"[IWSBase] EventReceive event = {e.Value.Name}, data = {strData}");
            };
            wsapi.Ws.EventNestJSException += (s, e) =>
            {
                Console.WriteLine($"[IWSBase] EventNestJSException status = {e.Value.Status}, error = {e.Value.Message}");
            };
            #endregion

            #region [ HubClient events ]
            wsapi.Hub.EventReceive += (s, e) =>
            {
                Console.WriteLine($"[HubClient] EventReceive service = {e.Value.service}, event = {e.Value.eventName}");
            };
            wsapi.Hub.EventSubscribed += (s, e) =>
            {
                Console.WriteLine($"[HubClient] EventSubscribed service = {e.Value.service}, event = {e.Value.eventName}");
            };
            wsapi.Hub.EventSubscriptionError += (s, e) =>
            {
                Console.WriteLine($"[HubClient] EventSubscriptionException service = {e.Value.Request.service}, event = {e.Value.Request.eventName}, exception = {e.Value.Exception.Message}");
            };
            #endregion
        }
        #endregion
    }
}
