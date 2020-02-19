using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Windows;
using System.Windows.Controls;
using template.api.wsclient;

namespace sample
{
    public partial class MainWindow : Window
    {
        #region [ properties ]
        public WSApi wsapi { get; set; } 
        public string token { get; set; }
        #endregion

        #region [ constructor ]
        public MainWindow()
        {
            InitializeComponent();
            wsapi = new WSApi();

            wsapi.EventWSError += (s, e) =>
            {
                Console.WriteLine($"[wsapi] EventWSError code = {e.Value.Code}, message = {e.Value.Message}");
            };

            // IWSBase events 
            wsapi.Ws.EventConnectionChange += (s, e) =>
            {
               if (e.Value)
                   Console.WriteLine($"[IWSBase] connected id = '{e.Value}'");
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

        #region [ Http Api ]
        private async void Button_Login(object sender, RoutedEventArgs e)
        {
            try
            {
                Console.WriteLine("[ui] Login");

                HttpClient client = new HttpClient
                {
                    BaseAddress = new Uri("http://localhost:3000")
                };
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var content = new FormUrlEncodedContent(new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("email", "admin@nex-group.io"),
                    new KeyValuePair<string, string>("password", "123456")
                });

                var response = await client.PostAsync("api/auth/jwtLogin", content);
                if (response.IsSuccessStatusCode)
                {
                    var strJson = await response.Content.ReadAsStringAsync();
                    var json = JToken.Parse(strJson);
                    token = json["token"].Value<string>(); 

                    Console.WriteLine($"[ui] jwt token = {token}");
                }
                else
                {
                    throw new Exception(response.ReasonPhrase);
                }
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
                wsapi.Ws.Connect("ws://localhost:3000/wsapi", "/", token);
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
                wsapi.Ws.Publish("test");
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
                wsapi.Ws.Publish("testException");
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
                var res = await wsapi.user.funcA("juan", "coll", 41);
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
                var res = await wsapi.user.funcB(new MyDTO { a = "juan", b = true }, "juan@nex-group.io");
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
                var res = await wsapi.user.funcC(1250);
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
                await wsapi.user.funcD("my data from c#");
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
                await wsapi.user.funcE("func E param");
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
                var res = await wsapi.user.emitEvents();
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
                var res = await wsapi.user.changeUser("juan", "coll");
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
                    await wsapi.user.onUpdateCredentials.Subscribe(123456);
                    Console.WriteLine($"[Response] subscribe ok");
                }
                if (name.EndsWith("Unsubscribe"))
                {
                    await wsapi.user.onUpdateCredentials.Unsubscribe();
                    Console.WriteLine($"[Response] unsubscribe ok");
                }
                if (name.EndsWith("On"))
                {
                    wsapi.user.onUpdateCredentials.On(() =>
                    {
                        Console.WriteLine($"[Subscription][On] {name}");
                    });
                }
                if (name.EndsWith("Off"))
                {
                    wsapi.user.onUpdateCredentials.off();
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
                    await wsapi.user.onUpdateCredentialsData.Subscribe(new List<MyDTO> { new MyDTO{ a = "01", b = true }, new MyDTO { a = "02", b = true } });
                    Console.WriteLine($"[Response] subscribe ok");
                }
                if (name.EndsWith("Unsubscribe"))
                {
                    await wsapi.user.onUpdateCredentialsData.Unsubscribe();
                    Console.WriteLine($"[Response] unsubscribe ok");
                }
                if (name.EndsWith("On"))
                {
                    wsapi.user.onUpdateCredentialsData.On((data) =>
                    {
                        Console.WriteLine($"[Subscription][On] {name} {JsonConvert.SerializeObject(data)}");
                    });
                }
                if (name.EndsWith("Off"))
                {
                    wsapi.user.onUpdateCredentialsData.off();
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
                    await wsapi.user.onUpdateData.Subscribe();
                    Console.WriteLine($"[Response] subscribe ok");
                }
                if (name.EndsWith("Unsubscribe"))
                {
                    await wsapi.user.onUpdateData.Unsubscribe();
                    Console.WriteLine($"[Response] unsubscribe ok");
                }
                if (name.EndsWith("On"))
                {
                    wsapi.user.onUpdateData.On((data) =>
                    {
                        Console.WriteLine($"[Subscription][On] {name} {JsonConvert.SerializeObject(data)}");
                    });
                }
                if (name.EndsWith("Off"))
                {
                    wsapi.user.onUpdateData.off();
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
                    await wsapi.user.onUpdate.Subscribe();
                    Console.WriteLine($"[Response] subscribe ok");
                }
                if (name.EndsWith("Unsubscribe"))
                {
                    await wsapi.user.onUpdate.Unsubscribe();
                    Console.WriteLine($"[Response] unsubscribe ok");
                }
                if (name.EndsWith("On"))
                {
                    wsapi.user.onUpdate.On(() =>
                    {
                        Console.WriteLine($"[Subscription][On] {name}");
                    });
                }
                if (name.EndsWith("Off"))
                {
                    wsapi.user.onUpdate.off();
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
