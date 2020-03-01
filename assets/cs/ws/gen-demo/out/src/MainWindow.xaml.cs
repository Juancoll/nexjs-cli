using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Windows;
using System.Windows.Controls;
using template.api.wsclient;

namespace demo.wsclient
{
    public partial class MainWindow : Window
    {
        #region [ properties ]
        public WSApi<User, string> wsapi { get; set; }
        public List<WSServiceDescriptor> Services = new List<WSServiceDescriptor>
        {
            {{#services}}
            new WSServiceDescriptor
            {
                Name = "{{serviceUpperName}}",
                Hubs = new List<HubDescriptor>
                {
                    {{#hubEvents}}
                    new HubDescriptor { IsAuth = {{isAuth}}, Service = "{{serviceUpperName}}", Name = "{{name}}", Credentials = "{{&defaults.credentials}}"  },
                    {{/hubEvents}}                   
                },
                Rests = new List<RestDescriptor>
                {
                    {{#restMethods}}
                    new RestDescriptor { IsAuth = {{isAuth}}, Service = "{{serviceUpperName}}", Name = "{{name}}", Data="{{&defaults.data}}", Credentials = "{{&defaults.credentials}}"  },                  
                    {{/restMethods}}
                }
            },
            {{/services}}
        };
        #endregion

        #region [ constructor ]
        public MainWindow()
        {
            InitializeComponent();
            Loaded += (s, e) => UpdateView(Services);


            wsapi = new WSApi<User, string>();

            wsapi.EventWSError += (s, e) =>
            {
                Console.WriteLine($"[wsapi] EventWSError code = {e.Value.Code}, message = {e.Value.Message}");
            };

            // IWSBase events 
            wsapi.Ws.EventConnectionChange += (s, e) =>
            {
               if (e.Value)
                   Console.WriteLine($"[IWSBase] connected '{e.Value}', id = {wsapi.Ws.Id}");
               else
                   Console.WriteLine($"[IWSBase] disconnected");
            };
            //wsapi.Ws.EventSubscriptionError += (s, e) =>
            //{
            //    Console.WriteLine($"[IWSBase] EventSubscriptionError event = {e.Value.Name}, error = {e.Value.Exception.Message}");
            //};
            //wsapi.Ws.EventNewSocketInstance += (s, e) =>
            {
               Console.WriteLine($"[IWSBase] EventNewSocketInstance");
            };
            //wsapi.Ws.EventSend += (s, e) =>
            //{
            //    var strData = e.Value.Data == null
            //        ? "null"
            //        : e.Value.Data.ToString();

            //    Console.WriteLine($"[IWSBase] EventSend event = {e.Value.Name}, data = {strData}");S
            //};
            //wsapi.Ws.EventReceive += (s, e) =>
            //{
            //    var strData = e.Value.Data == null
            //        ? "null"
            //        : e.Value.Data.ToString();

            //    Console.WriteLine($"[IWSBase] EventReceive event = {e.Value.Name}, data = {strData}");
            //};
            //wsapi.Ws.EventNestJSException += (s, e) =>
            //{
            //    Console.WriteLine($"[IWSBase] EventNestJSException status = {e.Value.Status}, error = {e.Value.Message}");
            //};

            // HubClient events 
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
        }
        #endregion

        #region [ private ]
        private void UpdateView(List<WSServiceDescriptor> services)
        {
            _uiTab.Items.Clear();
            services.ForEach(x => _uiTab.Items.Add(new TabItem { Header = x.Name, Content = new WSServiceControl(x) }));
        }
        #endregion

        #region [ Auth ]
        private async void Button_register(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] auth.register");
                await wsapi.Auth.Register(new { email = "admin@nex-group.io", password = "123456" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void Button_Login(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] auth.register");
                await wsapi.Auth.Login(new { email = "admin@nex-group.io", password = "123456" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void Button_Logout(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] auth.register");
                await wsapi.Auth.Logout();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void Button_authenticate(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] auth.register");
                await wsapi.Auth.Authenticate(wsapi.Auth.AuthInfo.token);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        #endregion

        #region [ Socket ]
        private void Button_Connect(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] Connect");
                wsapi.Ws.Connect("ws://localhost:3000/wsapi", "/");
            }
            catch(Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }

        private void Button_Disconnect(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] Disconnect");
                wsapi.Ws.Disconnect();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private void Button_NestJS_Test(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] nestjs test");
                wsapi.Ws.Emit("test");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }

        private void Button_NestJS_Test_Exception(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] nestjs test Exception");
                wsapi.Ws.Emit("testException");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        #endregion

        #region [ Rest ]
        private async void Button_FuncA(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] FuncA");
                var res = await wsapi.demo.funcA("juan", "coll", 41);
                Console.WriteLine($"[Response] {res}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }

        private async void Button_FuncB(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] FuncB");
                var res = await wsapi.demo.funcB(new MyDTO { a = "juan", b = true }, "juan@nex-group.io");
                Console.WriteLine($"[Response] {res}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void Button_FuncC(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] FuncC");
                var res = await wsapi.demo.funcC(1250);
                Console.WriteLine($"[Response] {res}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }

        private async void Button_FuncD(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] FuncD");
                await wsapi.demo.funcD("my data from c#");
                Console.WriteLine($"[Response] none (ok)");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }

        private async void Button_FuncE(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] FuncE");
                await wsapi.demo.funcE("func E param");
                Console.WriteLine($"[Response] none (ok)");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void Button_emitEvents(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] emitEvent");
                var res = await wsapi.demo.emitEvents();
                Console.WriteLine($"[Response] ");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void Button_ChangeUser(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] changeUser");
                var res = await wsapi.demo.changeUser("juan", "coll", new Player(), new Org());
                Console.WriteLine($"[Response] {JsonConvert.SerializeObject(res)}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        #endregion

        #region [ Hub ]
        private async void onUpdateCredentials(object sender, RoutedEventArgs e)
        {
            var name = (sender as Button).Name;
            Console.WriteLine($"[ui] {name}");
            try
            {               
                if (name.EndsWith("Subscribe"))
                {                 
                    await wsapi.demo.onUpdateCredentials.Subscribe(123456);
                    Console.WriteLine($"[Response] subscribe ok");
                }
                if (name.EndsWith("Unsubscribe"))
                {
                    await wsapi.demo.onUpdateCredentials.Unsubscribe();
                    Console.WriteLine($"[Response] unsubscribe ok");
                }
                if (name.EndsWith("On"))
                {
                    wsapi.demo.onUpdateCredentials.On(() =>
                    {
                        Console.WriteLine($"[Subscription][On] {name}");
                    });
                }
                if (name.EndsWith("Off"))
                {
                    wsapi.demo.onUpdateCredentials.off();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void onUpdateCredentialsData(object sender, RoutedEventArgs e)
        {
            var name = (sender as Button).Name;
            Console.WriteLine($"[ui] {name}");
            try
            {
                if (name.EndsWith("Subscribe"))
                {
                    await wsapi.demo.onUpdateCredentialsData.Subscribe(new List<MyDTO> { new MyDTO{ a = "01", b = true }, new MyDTO { a = "02", b = true } });
                    Console.WriteLine($"[Response] subscribe ok");
                }
                if (name.EndsWith("Unsubscribe"))
                {
                    await wsapi.demo.onUpdateCredentialsData.Unsubscribe();
                    Console.WriteLine($"[Response] unsubscribe ok");
                }
                if (name.EndsWith("On"))
                {
                    wsapi.demo.onUpdateCredentialsData.On((data) =>
                    {
                        Console.WriteLine($"[Subscription][On] {name} {JsonConvert.SerializeObject(data)}");
                    });
                }
                if (name.EndsWith("Off"))
                {
                    wsapi.demo.onUpdateCredentialsData.off();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void onUpdateData(object sender, RoutedEventArgs e)
        {
            var name = (sender as Button).Name;
            Console.WriteLine($"[ui] {name}");
            try
            {
                if (name.EndsWith("Subscribe"))
                {
                    await wsapi.demo.onUpdateData.Subscribe();
                    Console.WriteLine($"[Response] subscribe ok");
                }
                if (name.EndsWith("Unsubscribe"))
                {
                    await wsapi.demo.onUpdateData.Unsubscribe();
                    Console.WriteLine($"[Response] unsubscribe ok");
                }
                if (name.EndsWith("On"))
                {
                    wsapi.demo.onUpdateData.On((data) =>
                    {
                        Console.WriteLine($"[Subscription][On] {name} {JsonConvert.SerializeObject(data)}");
                    });
                }
                if (name.EndsWith("Off"))
                {
                    wsapi.demo.onUpdateData.off();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        private async void onUpdate(object sender, RoutedEventArgs e)
        {
            var name = (sender as Button).Name;
            Console.WriteLine($"[ui] {name}");
            try
            {
                if (name.EndsWith("Subscribe"))
                {
                    await wsapi.demo.onUpdate.Subscribe();
                    Console.WriteLine($"[Response] subscribe ok");
                }
                if (name.EndsWith("Unsubscribe"))
                {
                    await wsapi.demo.onUpdate.Unsubscribe();
                    Console.WriteLine($"[Response] unsubscribe ok");
                }
                if (name.EndsWith("On"))
                {
                    wsapi.demo.onUpdate.On(() =>
                    {
                        Console.WriteLine($"[Subscription][On] {name}");
                    });
                }
                if (name.EndsWith("Off"))
                {
                    wsapi.demo.onUpdate.off();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[error] {ex.Message}");
            }
        }
        #endregion        
    }
}
